import { useState, useRef } from "react";
import TimeAgo from "timeago-react";
//Firebase
import { auth, db } from "../firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { useCollection } from "react-firebase-hooks/firestore";
import {
  collection,
  doc,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  where,
} from "firebase/firestore";
//Styling
import styled from "styled-components";
import { Avatar, IconButton } from "@material-ui/core";
import MoreVertIcon from "@material-ui/icons/MoreVert";
import { AttachFile, InsertEmoticon, Mic } from "@material-ui/icons";
//Next
import { useRouter } from "next/router";
//Components
import Message from "./Message";
import getRecipientEmail from "../utils/getRecipientEmail";

function ChatScreen({ chat, messages }) {
  const serverMessages = messages;
  const [user] = useAuthState(auth);
  const [input, setInput] = useState("");
  const endOfMessagesRef = useRef(null);
  const router = useRouter();
  const docRef = doc(db, "chats", router.query.id);
  const [messagesSnapshot] = useCollection(
    collection(docRef, "messages"),
    query(orderBy("timestamp", "asc"))
  );

  const [recipientSnapshot] = useCollection(
    query(
      collection(db, "users"),
      where("email", "==", getRecipientEmail(chat.users, user))
    )
  );

  const showMessages = () => {
    if (messagesSnapshot) {
      let orderedMessages;
      // console.log(messagesSnapshot.docs);
      messagesSnapshot.docs.map((message) => console.log(message));
      console.log(
        messagesSnapshot.docs.map((message) => {
          return (orderedMessages = [
            orderedMessages,
            {
              message: message.id,
              user: message.data().user,
              message: message.data(),
              timestamp: message.data().timestamp,
            },
          ]);
        })
      );
      return messagesSnapshot.docs.map((message) => (
        <Message
          key={message.id}
          user={message.data().user}
          message={{
            ...message.data(),
            timestamp: message.data().timestamp?.toDate().getTime(),
          }}
        />
      ));
    } else {
      return JSON.parse(messages).map((message) => (
        <Message
          key={message.id}
          user={message.user}
          message={message.message}
        />
      ));
    }
  };

  const scrollToBottom = () => {
    endOfMessagesRef.current.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const sendMessage = (e) => {
    e.preventDefault();

    const userRef = doc(collection(db, "users"), user.uid);
    setDoc(userRef, { lastSeen: serverTimestamp() }, { merge: true });

    const chatRef = doc(collection(db, "chats"), router.query.id);
    setDoc(doc(collection(chatRef, "messages")), {
      timestamp: serverTimestamp(),
      message: input,
      user: user.email,
      photoURL: user.photoURL,
    });

    setInput("");
    scrollToBottom();
  };

  const recipientEmail = getRecipientEmail(chat.users, user);
  const recipient = recipientSnapshot?.docs?.[0]?.data();

  return (
    <Container>
      <Header>
        {recipient ? (
          <Avatar src={recipient?.photoURL} />
        ) : (
          <Avatar>{recipientEmail[0]}</Avatar>
        )}

        <HeaderInformation>
          <h3>{recipientEmail}</h3>
          {recipientSnapshot ? (
            <p>
              Last active:{" "}
              {recipient?.lastSeen?.toDate() ? (
                <TimeAgo datetime={recipient?.lastSeen?.toDate()} />
              ) : (
                "Unavailable"
              )}
            </p>
          ) : (
            <p>Loading last active...</p>
          )}
        </HeaderInformation>
        <HeaderIcons>
          <IconButton>
            <AttachFile />
          </IconButton>
          <IconButton>
            <MoreVertIcon />
          </IconButton>
        </HeaderIcons>
      </Header>

      <MessageContainer>
        {showMessages()}
        <EndOfMessage ref={endOfMessagesRef} />
      </MessageContainer>
      <InputContainer>
        <InsertEmoticon />
        <Input value={input} onChange={(e) => setInput(e.target.value)} />
        <button
          hidden
          disabled={!input}
          type="submit"
          onClick={(e) => sendMessage(e)}
        >
          Send Message
        </button>
        <Mic />
      </InputContainer>
    </Container>
  );
}

export default ChatScreen;

const Container = styled.div`
  flex: 0.45;
  border-right: 1px solid whitesmoke;
  height: 100vh;
  min-width: 300px;
  max-width: 100;
  overflow-y: scroll;

  ::-webkit-scrollbar {
    display: none;
  }

  -ms-overflow-tyle: none;
  scrollbar-width: none;
`;

const Input = styled.input`
  flex: 1;
  outline: 0;
  border: none;
  align-items: center;
  padding: 20px;
  border-radius: 10px;
  background-color: whitesmoke;
  margin-left: 15px;
  margin-right: 15px;
`;

const InputContainer = styled.form`
  display: flex;
  align-items: center;
  padding: 10px;
  bottom: 0;
  background-color: white;
  z-index: 100;
`;

const Header = styled.div`
  position: sticky;
  background-color: white;
  z-index: 100;
  top: 0;
  display: flex;
  padding: 11px;
  height: 80px;
  align-items: center;
  border-bottom: 1px solid whitesmoke;
`;

const HeaderInformation = styled.div`
  margin-left: 15px;
  flex: 1;

  > h3 {
    margin-bottom: 3px;
  }

  > p {
    font-size: 14px;
    color: gray;
  }
`;

const EndOfMessage = styled.div``;

const HeaderIcons = styled.div``;

const MessageContainer = styled.div`
  padding: 30px;
  background-color: #e5ded8;
  min-height: 90vh;
`;
