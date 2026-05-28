"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { PostViewModal } from "../components/modals/modal-post-view";

type PostModalContextData = {
  openPost: (postId: string) => void;
  closePost: () => void;
};

const PostModalContext = createContext<PostModalContextData | null>(null);

export function PostModalProvider({ children }: { children: ReactNode }) {
  const [postId, setPostId] = useState<string | null>(null);

  return (
    <PostModalContext.Provider
      value={{
        openPost: (id) => setPostId(id),
        closePost: () => setPostId(null),
      }}
    >
      {children}
      {postId && (
        <PostViewModal postId={postId} onClose={() => setPostId(null)} />
      )}
    </PostModalContext.Provider>
  );
}

export function usePostModal() {
  const ctx = useContext(PostModalContext);
  if (!ctx) throw new Error("usePostModal deve estar dentro de PostModalProvider");
  return ctx;
}
