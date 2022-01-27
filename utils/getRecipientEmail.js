const getRecipientEmail = (users, userLoggedIn) =>
  users?.filter((usertoFilter) => usertoFilter !== userLoggedIn?.email)[0];

export default getRecipientEmail;
