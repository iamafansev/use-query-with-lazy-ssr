import { useState, Suspense } from 'react';
import { useSuspenseQuery } from '@apollo/client';
import { Link, useParams } from 'react-router-dom';
import { graphql } from '../gql';

import Tabs from '../Tabs';

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

const CountryContent = () => {
  const [selectedTab, setSelectedTab] = useState('states');
  const { code } = useParams<'code'>();
  const { data } = useSuspenseQuery(COUNTRY_QUERY, {
    variables: { code: code! },
  });

  const { country } = data;

  return country ? (
    <>
      <Link to="/">&larr; Back to all</Link>
      <h1>
        {country.emoji} {country.name}
      </h1>
      <Tabs onChange={(value) => setSelectedTab(value)} value={selectedTab}>
        <Tabs.TabItem title="States" value="states">
          <States countryCode={country.code} />
        </Tabs.TabItem>
        <Tabs.TabItem title="Languages" value="languages">
          <Languages countryCode={country.code} />
        </Tabs.TabItem>
      </Tabs>
    </>
  ) : (
    <>Country does not exist!</>
  );
};

const Country = () => {
  return (
    <Suspense fallback={<>...loading</>}>
      <CountryContent />
    </Suspense>
  );
}

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

interface LanguagesProps {
  countryCode: string;
}

const LanguagesContent = ({ countryCode }: LanguagesProps) => {
  const { data } = useSuspenseQuery(LANGUAGES_QUERY, {
    variables: { countryCode },
  });

  return (
    <ul>
      {data?.country?.languages.map((language) => (
        <li key={language.code}>{language.name}</li>
      ))}
    </ul>
  );
};

const Languages = (props: LanguagesProps) => {
  return (
    <Suspense fallback={<>...loading</>}>
      <LanguagesContent {...props} />
    </Suspense>
  );
}

const STATES_QUERY = graphql(/* GraphQL */ `
  query StatesQuery($countryCode: ID!) {
    country(code: $countryCode) {
      code
      states {
        name
      }
    }
  }
`);

interface StatesProps {
  countryCode: string;
}

const StatesContent = ({ countryCode }: StatesProps) => {
  const { data } = useSuspenseQuery(STATES_QUERY, {
    variables: { countryCode },
  });

  const states = data?.country?.states ?? [];

  return states.length ? (
    <ul>
      {states.map((state) => (
        <li key={state.name}>{state.name}</li>
      ))}
    </ul>
  ) : (
    <>No states</>
  );
};

const States = (props: StatesProps) => {
  return (
    <Suspense fallback={<>...loading</>}>
      <StatesContent {...props} />
    </Suspense>
  );
}

export default Country;
