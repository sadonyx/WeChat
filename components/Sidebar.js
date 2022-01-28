import { useState } from "react";
import styled from "styled-components";
import * as EmailValidator from "email-validator";

//Components
import Chat from "./Chat";

//Firebase
import { signOut } from "firebase/auth";
import { auth, db } from "../firebase";
import { collection, addDoc, where, query } from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";
import { useCollection } from "react-firebase-hooks/firestore";

//Icons
import { Avatar, IconButton, Button } from "@mui/material";
import ChatIcon from "@mui/icons-material/chat";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import SearchIcon from "@mui/icons-material/Search";

function Sidebar() {
  const [search, setSearch] = useState("");
  const [user] = useAuthState(auth);
  const userChatRef = query(
    collection(db, "chats"),
    where("users", "array-contains", user.email)
  );
  const [chatsSnapshot] = useCollection(userChatRef);

  const createChat = () => {
    const input = prompt(
      "Plese enter an email address of the user you wish to chat with:"
    );

    if (!input) return null;

    if (
      //if chat does not already exist and is valid
      EmailValidator.validate(input) &&
      !chatAlreadyExists(input) &&
      input !== user.email
    ) {
      //We need to add the chat into the DB 'chats' collection
      // the way this 1-1 chat will work is that there will be a chat collection,
      // and each document will be a chat. inside the chat doc there will be a users array
      // the first user will be the user to initiate the chat, and the second user will be the inputted
      // user
      addDoc(collection(db, "chats"), {
        users: [user.email, input],
      });
    }
  };

  //query chat database to see if the chat between two users already exists
  const chatAlreadyExists = (recipientEmail) =>
    !!chatsSnapshot?.docs.find(
      (chat) =>
        chat.data().users.find((user) => user === recipientEmail)?.length > 0
    );

  return (
    <Container>
      <Header>
        <UserAvatar
          title="Sign Out"
          src={user.photoURL}
          onClick={() => signOut(auth)}
        />
        <IconsContainer>
          <IconButton>
            <ChatIcon />
          </IconButton>
          <IconButton>
            <MoreVertIcon />
          </IconButton>
        </IconsContainer>
      </Header>
      <Search>
        <SearchIcon />
        <SearchInput
          placeholder="Search in chats"
          type="text"
          onChange={(e) => setSearch(e.target.value)}
        />
      </Search>
      <SidebarButton onClick={createChat}>Start a new chat</SidebarButton>

      {/* list of chats */}
      {search.length > 0
        ? chatsSnapshot?.docs
            .filter((li) =>
              li.data().users[1].toLowerCase().includes(search.toLowerCase())
            )
            .map((chat) => (
              <Chat key={chat.id} id={chat.id} users={chat.data().users} />
            ))
        : chatsSnapshot?.docs.map((chat) => (
            <Chat key={chat.id} id={chat.id} users={chat.data().users} />
          ))}
      {/* {chatsSnapshot?.docs.map((chat) => (
        <Chat key={chat.id} id={chat.id} users={chat.data().users} />
      ))} */}
    </Container>
  );
}

export default Sidebar;

const Container = styled.div``;

const Search = styled.div`
  display: flex;
  align-items: center;
  padding: 20px;
  border-radius: 2px;
`;

const SearchInput = styled.input`
  outline-width: 0;
  border: none;
  flex: 1;
`;

const SidebarButton = styled(Button)`
  width: 100%;
  border-top: 1px solid whitesmoke;
  border-bottom: 1px solid whitesmoke;
`;

const Header = styled.div`
  display: flex;
  position: sticky;
  top: 0;
  background-color: white;
  z-index: 1;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  height: 80px;
  border-bottom: 1px solid whitesmoke;
`;

const UserAvatar = styled(Avatar)`
  cursor: pointer;
  transition: 0.3s ease-in-out;

  :hover {
    opacity: 0.8;
  }
`;

const IconsContainer = styled.div``;
