import { useParams } from 'common'
import IntegrationsLayout from 'components/layouts/Integrations/layout'
import { IntegrationPageHandler } from 'pages/project/[ref]/integrations/[id]/IntegrationPageHandler'
import { NextPageWithLayout } from 'types'

const IntegrationPage: NextPageWithLayout = () => {
  const { id, pageId } = useParams()

  // Get the corresponding component dynamically
  if (!id) {
    return <div>Not found</div>
  }

  const Component = IntegrationPageHandler()

  if (!Component) return <div>Not found</div>

  return <Component />
}

IntegrationPage.getLayout = (page) => <IntegrationsLayout>{page}</IntegrationsLayout>

export default IntegrationPage
