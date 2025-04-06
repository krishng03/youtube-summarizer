import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { saveYtUrl } from "./actions";
import Summary from "./Summary";
import Cards from "./Cards";
import Images from "./Images";

const App = () => {
  const ytUrl = useSelector((state) => state.ytUrl);
  const dispatch = useDispatch();

  const saveYtUrlLocal = (e) => {
    e.preventDefault();
    const ytUrlInput = document.getElementById("search").value;
    dispatch(saveYtUrl(ytUrlInput));
  };

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      <header className="bg-white shadow p-4">
        <div className="bg-gray-200 m-4 rounded-lg p-6 text-center">
          <h2 className="text-3xl font-bold">YouTube Summarizer</h2>
          <p className="py-4">
            Enter the URL of a YouTube video below and click "Summarize" to get a summary.
          </p>
          <div className="p-4">
            <form className="m-4">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <svg
                    className="w-4 h-4 text-gray-500"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 20 20"
                  >
                    <path
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
                    />
                  </svg>
                </div>
                <input
                  type="search"
                  id="search"
                  className="block w-full p-4 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="YouTube Video URL"
                  required
                />
                <button
                  type="submit"
                  className="text-white absolute right-2 bottom-2 bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2"
                  onClick={saveYtUrlLocal}
                >
                  Summarize
                </button>
              </div>
            </form>
          </div>
        </div>
      </header>
      {ytUrl && (
        <main className="flex flex-grow bg-gray-100">
          <Router>
            <div className="flex w-full p-4">
              <nav className="w-1/4 bg-gray-200 rounded-lg p-4 h-full">
                <ul className="space-y-2">
                  <li>
                    <Link
                      to="/"
                      className="block p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-700"
                    >
                      Summary
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/cards"
                      className="block p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-700"
                    >
                      Cards
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/images"
                      className="block p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-700"
                    >
                      Images
                    </Link>
                  </li>
                </ul>
              </nav>
              <div className="w-3/4 bg-gray-300 rounded-lg p-4 ml-2">
                <Routes>
                  <Route path="/" element={<Summary />} />
                  <Route path="/cards" element={<Cards />} />
                  <Route path="/images" element={<Images />} />
                </Routes>
              </div>
            </div>
          </Router>
        </main>
      )}
    </div>
  );
};

export default App;