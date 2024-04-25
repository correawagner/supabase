import React from 'react'
import CreateWarehouseAccessToken from './CreateWarehouseAccessToken'
import { FormHeader } from 'components/ui/Forms'
import { useIsProjectActive } from 'components/layouts/ProjectLayout/ProjectContext'
import {
  AlertDescription_Shadcn_,
  Alert_Shadcn_,
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Input,
  cn,
} from 'ui'
import { AlertCircle, Link, MoreVertical, TrashIcon } from 'lucide-react'
import { AlertTitle } from '@ui/components/shadcn/ui/alert'
import { useParams } from 'common'
import { useWarehouseAccessTokensQuery } from 'data/analytics/warehouse-access-tokens-query'
import { GenericSkeletonLoader } from 'ui-patterns'
import Table from 'components/to-be-cleaned/Table'
import { useCreateWarehouseAccessToken } from 'data/analytics/warehouse-access-tokens-create-mutation'
import toast from 'react-hot-toast'
import { ProjectPausedAlert } from 'components/ui/ProjectPausedAlert'
import { set } from 'lodash'
import { useDeleteWarehouseAccessToken } from 'data/analytics/warehouse-access-tokens-delete-mutation'
import CopyButton from 'components/ui/CopyButton'

const AccessTokenItem = ({
  token,
  id,
  name,
  onDeleteClick,
  inserted_at,
}: {
  token: string
  id: string
  name: string
  inserted_at: string
  onDeleteClick: (id: string) => void
}) => {
  const formattedInsertedAt = new Date(inserted_at).toLocaleString()

  return (
    <Table.tr className="group">
      <Table.td>{name}</Table.td>
      <Table.td>{formattedInsertedAt}</Table.td>
      <Table.td>
        <div className="flex gap-1 relative">
          <Input disabled defaultValue={token} type="password" size="tiny" className="flex-grow" />
          <div className="w-[88px]">
            <CopyButton
              type="outline"
              text={token}
              className="group-hover:opacity-100 opacity-0 transition-opacity absolute right-0"
            />
          </div>
        </div>
      </Table.td>
      <Table.td className="!p-1.5 text-right">
        <DropdownMenu>
          <DropdownMenuTrigger className="h-8 w-8 p-2 focus-visible:outline-none">
            <MoreVertical size="14" />
          </DropdownMenuTrigger>
          <DropdownMenuContent className="max-w-40">
            <DropdownMenuItem
              className="flex gap-1.5 "
              onClick={(e) => {
                e.preventDefault()
                onDeleteClick(id)
              }}
            >
              <TrashIcon size="14" />
              Revoke token
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </Table.td>
    </Table.tr>
  )
}

const WarehouseAccessTokens = () => {
  const isProjectActive = useIsProjectActive()
  const params = useParams()
  const projectRef = params.ref as string

  const accessTokensQuery = useWarehouseAccessTokensQuery({ projectRef })
  const hasAccessTokens = accessTokensQuery.isSuccess && accessTokensQuery.data.data.length > 0
  const [tokenToDelete, setTokenToDelete] = React.useState<string | null>(null)
  const [showDeleteDialog, setShowDeleteDialog] = React.useState(false)

  const deleteWarehouseAccessToken = useDeleteWarehouseAccessToken({
    projectRef,
    onSuccess: () => {
      toast.success('Access token revoked')
    },
    onError: () => {
      toast.error('Failed to revoke access token')
    },
  })

  const createWarehouseAccessToken = useCreateWarehouseAccessToken({
    projectRef,
    onSuccess: () => {
      toast.success('Access token created')
    },
  })

  return (
    <div className="1xl:px-28 mx-auto flex flex-col gap-y-10 px-5 py-6 lg:px-16 xl:px-24 2xl:px-32 pb-32">
      <section>
        <FormHeader
          title="Warehouse access tokens"
          description="Manage your warehouse access tokens for this project."
          actions={
            <CreateWarehouseAccessToken
              onSubmit={async ({ description }) => {
                await createWarehouseAccessToken.mutateAsync({ name: description })
              }}
            />
          }
        />
        <div
          className={cn([
            'bg-surface-100',
            'overflow-hidden border-muted',
            'rounded-md border shadow',
          ])}
        >
          {!isProjectActive ? (
            <ProjectPausedAlert
              projectRef={projectRef}
              description="Restore your project to manage your warehouse access tokens"
            />
          ) : (
            <>
              {accessTokensQuery.isLoading ? (
                <div className="p-4">
                  <GenericSkeletonLoader />
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table
                    head={[
                      <Table.th key="desc">Description</Table.th>,
                      <Table.th key="token">Created at</Table.th>,
                      <Table.th key="token">Token</Table.th>,
                      <Table.th key="actions" />,
                    ]}
                    body={
                      hasAccessTokens ? (
                        accessTokensQuery.data.data.map((accessToken) => (
                          <AccessTokenItem
                            key={accessToken.id + '-wh-access-token'}
                            token={accessToken.token}
                            id={accessToken.id}
                            inserted_at={accessToken.inserted_at}
                            name={accessToken.description || 'No description'}
                            onDeleteClick={() => {
                              setShowDeleteDialog(true)
                              setTokenToDelete(accessToken.token)
                            }}
                          />
                        ))
                      ) : (
                        <Table.tr>
                          <Table.td colSpan={4}>
                            <p className="text-sm text-foreground">No access tokens created</p>
                            <p className="text-sm text-foreground-light">
                              There are no access tokens associated with your project yet
                            </p>
                          </Table.td>
                        </Table.tr>
                      )
                    }
                  />
                </div>
              )}
            </>
          )}
        </div>
        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <DialogContent className="p-4">
            <DialogTitle>Revoke warehouse access token</DialogTitle>
            <DialogDescription>
              This action is irreversible and requests made with these access tokens will stop
              working.
            </DialogDescription>
            <div className="flex justify-end gap-2">
              <Button
                type="outline"
                onClick={() => {
                  setShowDeleteDialog(false)
                  setTokenToDelete(null)
                }}
              >
                Cancel
              </Button>
              <Button
                type="danger"
                loading={deleteWarehouseAccessToken.isLoading}
                onClick={async () => {
                  if (!tokenToDelete) return
                  await deleteWarehouseAccessToken.mutateAsync(tokenToDelete)
                  setShowDeleteDialog(false)
                  setTokenToDelete(null)
                }}
              >
                Yes, revoke access keys
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </section>
    </div>
  )
}

export default WarehouseAccessTokens
