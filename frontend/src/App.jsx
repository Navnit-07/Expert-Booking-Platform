import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import ExpertListing from "./pages/ExpertListing";
import ExpertDetail from "./pages/ExpertDetail";
import BookSession from "./pages/BookSession";
import MyBookings from "./pages/MyBookings";

const App = () => (
    <Routes>
        <Route element={<Layout />}>
            <Route path="/" element={<ExpertListing />} />
            <Route path="/expert/:id" element={<ExpertDetail />} />
            <Route path="/book" element={<BookSession />} />
            <Route path="/my-bookings" element={<MyBookings />} />
        </Route>
    </Routes>
);

export default App;
