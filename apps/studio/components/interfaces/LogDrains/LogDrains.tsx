import { LogDrainData, useLogDrainsQuery } from 'data/log-drains/log-drains-query'
import { LOG_DRAIN_TYPES, LogDrainType } from './LogDrains.constants'
import { useParams } from 'common'
import CardButton from 'components/ui/CardButton'
import Panel from 'components/ui/Panel'
import { GenericSkeletonLoader } from 'ui-patterns'
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from 'ui'
import { MoreHorizontal, Pen, Pencil, TrashIcon } from 'lucide-react'
import ConfirmationModal from 'ui-patterns/Dialogs/ConfirmationModal'
import { useState } from 'react'
import { useDeleteLogDrainMutation } from 'data/log-drains/delete-log-drain-mutation'
import AlertError from 'components/ui/AlertError'
import toast from 'react-hot-toast'
import { useCurrentOrgPlan } from 'hooks/misc/useCurrentOrgPlan'
import UpgradeToPro from 'components/ui/UpgradeToPro'
import Link from 'next/link'
import { useSelectedOrganization } from 'hooks/misc/useSelectedOrganization'
import { CardContent, CardDescription, CardTitle } from '@ui/components/shadcn/ui/card'

export function LogDrains({
  onNewDrainClick,
  onUpdateDrainClick,
}: {
  onNewDrainClick: (src: LogDrainType) => void
  onUpdateDrainClick: (drain: LogDrainData) => void
}) {
  const org = useSelectedOrganization()

  const { isLoading: orgPlanLoading, plan } = useCurrentOrgPlan()

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedLogDrain, setSelectedLogDrain] = useState<LogDrainData | null>(null)
  const { ref } = useParams()
  const { data: logDrains, isLoading, refetch, error, isError } = useLogDrainsQuery({ ref })
  const { mutate: deleteLogDrain } = useDeleteLogDrainMutation({
    onSuccess: () => {
      setIsDeleteModalOpen(false)
      setSelectedLogDrain(null)
    },
    onError: () => {
      setIsDeleteModalOpen(false)
      setSelectedLogDrain(null)
      toast.error('Failed to delete log drain')
    },
  })

  if (isLoading || orgPlanLoading) {
    return (
      <div>
        <GenericSkeletonLoader />
      </div>
    )
  }

  if (plan?.id === 'free' || plan?.id === 'pro') {
    return (
      <div className="p-8">
        <CardButton title="Upgrade to Pro" description="Upgrade to a Team Plan to use Log Drains">
          <Button className="mt-2" asChild>
            <Link href={`/org/${org?.slug}/billing`}>Upgrade to Pro</Link>
          </Button>
        </CardButton>
      </div>
    )
  }

  if (!isLoading && logDrains?.length === 0) {
    return (
      <div className="grid grid-cols-2 gap-3">
        {LOG_DRAIN_TYPES.map((src) => (
          <CardButton
            key={src.value}
            title={src.name}
            description={src.description}
            icon={src.icon}
            onClick={() => {
              onNewDrainClick(src.value)
            }}
          />
        ))}
      </div>
    )
  }

  if (isError) {
    return <AlertError error={error}></AlertError>
  }

  return (
    <>
      <Panel className="">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[250px]">Name</TableHead>
              <TableHead>Source</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="text-right">
                <div className="sr-only">Actions</div>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logDrains?.map((drain) => (
              <TableRow key={drain.id}>
                <TableCell className="font-medium">{drain.name}</TableCell>
                <TableCell>{drain.type}</TableCell>
                <TableCell>{drain.description}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        type="text"
                        className="px-1 opacity-50 hover:opacity-100 !bg-transparent"
                        icon={<MoreHorizontal />}
                      />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="max-w-[140px]" align="end">
                      <DropdownMenuItem
                        onClick={() => {
                          onUpdateDrainClick(drain)
                        }}
                      >
                        <Pencil className="h-4 w-4 mr-2" />
                        Update
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                          setSelectedLogDrain(drain)
                          setIsDeleteModalOpen(true)
                        }}
                      >
                        <TrashIcon className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>

          <ConfirmationModal
            title="Delete Log Drain"
            visible={isDeleteModalOpen}
            onConfirm={() => {
              if (selectedLogDrain && ref) {
                deleteLogDrain({ token: selectedLogDrain.token, projectRef: ref })
              }
            }}
            onCancel={() => setIsDeleteModalOpen(false)}
          >
            <div className="text-foreground-light">
              <p>
                Are you sure you want to delete{' '}
                <span className="text-foreground">{selectedLogDrain?.name}</span>?
              </p>
              <p>This action cannot be undone.</p>
            </div>
          </ConfirmationModal>
        </Table>
      </Panel>
    </>
  )
}
