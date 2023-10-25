import {Suspense} from 'react';
import { useQuery } from '@apollo/client';
import { graphql } from '../gql';

const LANGUAGES_QUERY = graphql(/* GraphQL */ `
  query LanguagesQuery($countryCode: ID!) {
    country(code: $countryCode) {
      code
      languages {
        code
        name
      }
    }
  }
`);

const IndexContent = () => {
  const { data: langData, loading } = useQuery(LANGUAGES_QUERY, {
    variables: { countryCode: 'RU' },
    fetchPolicy: 'cache-and-network'
  });

  if (loading) return <>...loading</>;

  return (
    <ul className="list-style-none">
      <code>{JSON.stringify(langData)}</code>
      <hr />
    </ul>
  );
};

const Index = () => {
  return (
    <Suspense fallback={<>...loading</>}>
      <IndexContent />
    </Suspense>
  );
}

export default Index;
