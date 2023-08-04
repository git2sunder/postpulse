import Link from "next/link";
import Image from "next/image";
import { useUser } from "@auth0/nextjs-auth0/client";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCoins } from "@fortawesome/free-solid-svg-icons";
import { Logo } from "../logo";

export const AppLayout = ({ children, posts }) => {
  const { user } = useUser();
  
  return (
    <div className="grid grid-cols-[300px_1fr] h-screen max-h-screen">
      <div className="flex flex-col text-white overflow-hidden">
        <div className="bg-space-900 px-2">
          <Logo />
          <Link href="/post/new" className="bg-indigo-600 tracking-wider w-full text-center text-white font-bold cursor-pointer uppercase px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors block">
            New Post
          </Link>
          <br></br>
        </div>
        <div className="px-4 flex-1 overflow-auto bg-gradient-to-b from-space-900 to-space-700">
          {posts.map( post => (
            <Link key={post.id} href={`/post/${post.id}`} className="py-1 block text-ellipsis overflow-hidden whitespace-nowrap my-1 px-2 bg-white/10 cursor-pointer rounded-sm text-white hover:bg-indigo-500 hover:text-white">
              {post.topic}
            </Link>
          ))}
        </div>
        <div className="bg-space-700 flex items-center gap-2 border-t border-t-black/50 h-20 px-2">
          {!!user ? (
            <>
              <div className="min-w-[50px]">
                <Image
                  src={user.picture}
                  alt={user.name}
                  height={50}
                  width={50}
                  className="rounded-full"
                />
              </div>
              <div className="flex-1">
                <div className="font-bold">{user.email}</div>
                <Link className="text-sm text-indigo-600 hover:text-indigo-700" href="/api/auth/logout">
                  Logout
                </Link>
              </div>
            </>
          ) : (
            <Link className="text-indigo-600 hover:text-indigo-700" href="/api/auth/login">Login</Link>
          )}
        </div>
      </div>
      {children}
    </div>
  );
};
