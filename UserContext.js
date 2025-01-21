import React, { createContext, useState, useContext } from 'react';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [userId, setUserId] = useState(null);
  const [playlistId, setPlaylistId] = useState(null);

  return (
    <UserContext.Provider value={{ userId, setUserId , playlistId , setPlaylistId}}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
