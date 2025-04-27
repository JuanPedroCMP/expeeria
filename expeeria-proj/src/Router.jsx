import { Routes, Route } from "react-router-dom";

import { LayoutPadrao } from "./layouts";
import { Inicial, NotFound } from "./pages";

const Router = () => {
  return (
    <Routes>
      <Route path="/" element={<LayoutPadrao />}>
        <Route index element={<Inicial />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
};

export { Router };