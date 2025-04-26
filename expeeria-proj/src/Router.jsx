import { Routes, Route } from "react-router-dom";
import { Inicial } from "./pages/Inicial/Inicial.jsx";
import { LayoutPadrao } from "./layouts";

const Router = () => {
  return (
    <Routes>
      <Route path="/" element={<LayoutPadrao />}>
        <Route index element={<Inicial />} />
        {/* <Route path="*" element={<NotFound />} /> */}
      </Route>
    </Routes>
  );
};

export { Router };