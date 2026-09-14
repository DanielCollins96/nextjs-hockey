export async function getServerSideProps() {
  return {
    redirect: {
      destination: '/drafts?view=teams',
      permanent: false,
    },
  }
}

export default function DraftTeamsIndex() {
  return null
}
