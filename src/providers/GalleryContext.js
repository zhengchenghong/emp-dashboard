import React, { useState, useContext } from 'react';

const GalleryContext = React.createContext(null);
GalleryContext.displayName = 'GalleryContext';

const GalleryContextProvider = ({ ...props }) => {
  const [openRight, setOpenRight] = useState(false);
  const [galleryData, setGalleryData] = useState({});
  const [GalleryChildren, setGalleryChildren] = useState();
  const [imageURL, setImageURL] = useState();
  const [imageData, setImageData] = useState();
  const [searchGallery, setSearchGallery] = useState();
  const [openUserModal, setOpenUserModal] = useState(false);

  const value = {
    openRight,
    setOpenRight,
    GalleryChildren,
    setGalleryChildren,
    galleryData,
    setGalleryData,
    imageURL,
    setImageURL,
    imageData,
    setImageData,
    searchGallery,
    setSearchGallery,
    openUserModal,
    setOpenUserModal
  };

  return <GalleryContext.Provider value={value} {...props} />;
};

const useGalleryContext = () => {
  return useContext(GalleryContext);
};

export { GalleryContextProvider, useGalleryContext };
