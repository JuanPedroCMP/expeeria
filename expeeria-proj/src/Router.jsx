import { Routes, Route } from "react-router-dom";
import { PostPage } from "./pages/PostPage/PostPage";
import { LayoutPadrao } from "./layouts";
import { Inicial, NotFound } from "./pages";
import { CreatePost } from "./pages/CreatePost";
import { EditPost } from "./components/EditPost/EditPost";
import { Login } from "./pages/Login/Login";
import { SignUp } from "./pages/SignUp/SignUp";
import { PrivateRoute } from "./components/PrivateRoute";
import { Profile } from "./pages/Profile/Profile";
import { Explore } from "./pages/Explore/Explore";
import { Presentation } from "./pages/Presentation/Presentation";

const Router = () => {
  return (
    <Routes>
      <Route path="/apresentacao" element={<Presentation />} />
      <Route path="/" element={<LayoutPadrao />}>
        <Route index element={<Inicial />} />
        <Route path="/explorar" element={<Explore />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route
          path="/criar_post"
          element={
            <PrivateRoute>
              <CreatePost />
            </PrivateRoute>
          }
        />
        <Route
          path="/editar/:id"
          element={
            <PrivateRoute>
              <EditPost />
            </PrivateRoute>
          }
        />
        <Route
          path="/perfil/:id"
          element={
            <PrivateRoute>
              <Profile />
            </PrivateRoute>
          }
        />
        <Route
          path="/perfil"
          element={
            <PrivateRoute>
              <Profile />
            </PrivateRoute>
          }
        />
        <Route path="post/:id" element={<PostPage />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
};

export { Router };
