
import { PostProvider } from "../../contexts/PostContext";
import { NewPost } from "../../components/NewPost/NewPost";
import { Button } from "../../components";

const CratePost = () => {
  return (
    <PostProvider>
      <NewPost />
    </PostProvider>
  );
};

export { CratePost };
