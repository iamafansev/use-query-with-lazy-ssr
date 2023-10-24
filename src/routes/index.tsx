import {Suspense} from 'react';
import { useSuspenseQuery } from '@apollo/client';
import { Link } from 'react-router-dom';
import { graphql } from '../gql';

const ALL_COUNTRIES_QUERY = graphql(/* GraphQL */ `
  query AllCountriesQuery {
    countries {
      code
      name
    }
  }
`);

const COUNTRY_QUERY = graphql(/* GraphQL */ `
  query CountryQuery($code: ID!) {
    country(code: $code) {
      code
      name
      capital
      emoji
    }
  }
`);

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

const Country = () => {
  const { data: countryData } = useSuspenseQuery(COUNTRY_QUERY, {
    variables: { code: 'YT' },
  });

  return <code>{JSON.stringify(countryData)}</code>;
};

const IndexContent = () => {
  const { data: langData } = useSuspenseQuery(LANGUAGES_QUERY, {
    variables: { countryCode: 'RU' },
  });

  // const { data: allCountriesData } = useSuspenseQuery(ALL_COUNTRIES_QUERY);

  return (
    <ul className="list-style-none">
      <code>{JSON.stringify(langData)}</code>
      <hr />
      <Suspense fallback={<>...loading</>}>
        <Country />
      </Suspense>
      {/* {allCountriesData?.countries.map((country) => (
        <li key={country.code}>
          <Link to={`/countries/${country.code}`}>
            {country.code} - {country.name}
          </Link>
        </li>
      ))} */}
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
