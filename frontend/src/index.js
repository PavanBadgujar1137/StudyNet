import React from "react";
import ReactDOM from "react-dom/client";
// ─── OpenHand Global Styles (Design Tokens, Tailwind, Components & Pages)
import "./styles/global.css";
import "./styles/openhand-apps.css";
import App from "./App";

import { BrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import rootReducer from "./reducer";

const store = configureStore({
  reducer: rootReducer,
});

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <App />
        <Toaster
          position="top-center"
          gutter={8}
          containerStyle={{ top: 20 }}
          toastOptions={{
            duration: 4000,
            style: {
              background: '#1E293B',
              color: '#F8FAFC',
              borderRadius: '12px',
              fontSize: '13px',
              border: '1px solid #334155',
              boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)',
            },
            success: {
              duration: 3500,
              iconTheme: {
                primary: '#10B981',
                secondary: '#FFFFFF',
              },
            },
            error: {
              duration: 4000,
              iconTheme: {
                primary: '#EF4444',
                secondary: '#FFFFFF',
              },
            },
          }}
        />
      </BrowserRouter>
    </Provider>
  </React.StrictMode>
);
