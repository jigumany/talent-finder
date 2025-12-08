
'use client';

import { useEffect, useState } from 'react';
import { FirebaseProvider, initializeFirebase } from '.';

// This is a client-only provider that will not be rendered on the server.
// It is used to ensure that Firebase is initialized only once on the client.
export const FirebaseClientProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [firebase, setFirebase] = useState<any>(null);

  useEffect(() => {
    const apps = initializeFirebase();
    setFirebase(apps);
  }, []);

  return <FirebaseProvider {...firebase}>{children}</FirebaseProvider>;
};
