//Components
import getRecipientEmail from "../utils/getRecipientEmail";
//Firebase
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "../firebase";
//Style
import { Avatar } from "@material-ui/core";
import styled from "styled-components";
import { useCollection } from "react-firebase-hooks/firestore";
import { collection, where, query } from "firebase/firestore";
import { useRouter } from "next/router";

function Chat({ id, users }) {
  const router = useRouter();
  const [user] = useAuthState(auth);
  const [recipientSnapshot] = useCollection(
    query(
      collection(db, "users"),
      where("email", "==", getRecipientEmail(users, user))
    )
  );

  const enterChat = () => {
    router.push(`/chat/${id}`);
  };

  const recipientEmail = getRecipientEmail(users, user);
  const recipient = recipientSnapshot?.docs?.[0]?.data();

  return (
    <Container onClick={enterChat}>
      {recipient ? (
        <UserAvatar src={recipient?.photoURL} />
      ) : (
        <UserAvatar>{recipientEmail[0]}</UserAvatar>
      )}

      <p>{recipientEmail}</p>
    </Container>
  );
}

export default Chat;

const Container = styled.div`
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 15px;
  word-break: break-word;
  transition: 0.3s ease-in-out;
  :hover {
    background-color: #e9eaeb;
  }
`;

const UserAvatar = styled(Avatar)`
  margin: 5px;
  margin-right: 15px;
`;
