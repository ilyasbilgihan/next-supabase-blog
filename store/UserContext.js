import * as React from 'react';

const UserContext = React.createContext();

function useProvideAuth() {
  const [user, setUser] = React.useState(null);
  const [registration, setRegistration] = React.useState(false);

  React.useEffect(() => {
    if (user) {
      window.localStorage.setItem('user-data', JSON.stringify(user));
    }
  }, [user]);

  const signIn = async (userId) => {
    const res = await fetch(`/api/users/${userId}`);
    const user = await res.json();

    // user data available
    if (res.status === 200) {
      setUser(user.data);
    } else if (res.status === 404) {
      // user's data is not available, must complete registration
      setRegistration(true);
    } else {
      // must be a server/network error, try again fetching the user data
      signIn(userId);
    }
  };
  const signOut = () => {
    window.localStorage.removeItem('user-data');
    setUser(null);
  };
  return { user, signIn, signOut, setUser, registration, setRegistration };
}

function UserProvider({ children }) {
  const value = useProvideAuth();
  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

function useUser() {
  const context = React.useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}

export { UserProvider, useUser };
