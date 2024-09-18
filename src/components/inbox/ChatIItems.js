import gravatarUrl from "gravatar-url";
import moment from "moment";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { conversationsApi, useGetConversationsQuery, useGetMoreConversationsQuery } from "../../features/conversations/conversationsApi";
import getPartnerInfo from "../../utils/getPartnerInfo";
import Error from "../ui/Error";
import ChatItem from "./ChatItem";
import InfiniteScroll from "react-infinite-scroll-component";
import { useEffect, useState } from "react";

export default function ChatItems() {
  const { user } = useSelector((state) => state.auth) || {};
  const { email } = user || {};
  const { data, isLoading, isError, error } = useGetConversationsQuery(email);
  const { data: conversations, totalCount } = data || {};
  // page state mangement
  const [page, setPage] = useState(1);
  const [haseMore, setHasMore] = useState(true);
const dispatch = useDispatch()
  // for updating pages number more
  const ferchMore = () => {
    setPage((prevPage) => prevPage + 1);
  };

//   for dispatch the getMoreConversations
useEffect(()=>{
    if(page > 1){
        // u cant import useGetmoreConversations of react state in a useEffect
dispatch(conversationsApi.endpoints.getMoreConversations.initiate({email, page}))
    }
},[page, email, dispatch])
  // to render the pages more
  useEffect(() => {
    if (totalCount > 0) {
      // hare page in current page number
      const more =
        Math.ceil(
          totalCount / Number(process.env.REACT_APP_CONVERSATIONS_PER_PAGE)
        ) > page;
      setHasMore(more);
    }
  }, [totalCount, page]);
  // decide what to render
  let content = null;

  if (isLoading) {
    content = <li className="m-2 text-center">Loading...</li>;
  } else if (!isLoading && isError) {
    content = (
      <li className="m-2 text-center">
        <Error message={error?.data} />
      </li>
    );
  } else if (!isLoading && !isError && conversations?.length === 0) {
    content = <li className="m-2 text-center">No conversations found!</li>;
  } else if (!isLoading && !isError && conversations?.length > 0) {
    content = (
      <InfiniteScroll
        dataLength={conversations.length} //This is important field to render the next data
        next={() => console.log("next")}
        hasMore={haseMore}
        loader={<h4>Loading...</h4>}
        height={window.innerHeight - 129}
      >
        {conversations.map((conversation) => {
          const { id, message, timestamp } = conversation;
          const { email } = user || {};
          const { name, email: partnerEmail } = getPartnerInfo(
            conversation.users,
            email
          );

          return (
            <li key={id}>
              <Link to={`/inbox/${id}`}>
                <ChatItem
                  avatar={gravatarUrl(partnerEmail, {
                    size: 80,
                  })}
                  name={name}
                  lastMessage={message}
                  lastTime={moment(timestamp).fromNow()}
                />
              </Link>
            </li>
          );
        })}{" "}
      </InfiniteScroll>
    );
  }

  return <ul>{content}</ul>;
}
