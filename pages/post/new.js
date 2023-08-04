import { withPageAuthRequired } from "@auth0/nextjs-auth0";
import { AppLayout } from "../../components/AppLayout";
import { useState } from "react";
import { useRouter } from "next/router";
import { getAppProps } from "../../utils/getAppProps";

export default function NewPost(props) {
  const router = useRouter();
  const [task, setTask] = useState("");
  const [topic, setTopic] = useState("");
  const [keywords, setKeywords] = useState("");
  const [imagePrompt, setImagePrompt] = useState("");
  const [wordCount, setWordCount] = useState(0);
  const [postType, setPostType] = useState("Twitter"); // or "BlogPost" or "Twitter"
  const [generateImage, setGenerateImage] = useState(false);

  const tasks = {
    expand: {
      title: "Expand your idea",
      prompt: "Enter a brief concept you would like to expand upon.",
    },
    critique: {
      title: "Critique an argument",
      prompt: "Enter an argument you would like to evaluate.",
    },
    tutorial: {
      title: "Create a tutorial",
      prompt: "Specify a topic for a step-by-step guide or tutorial.",
    },
    content: {
      title: "Generate original content",
      prompt: "Describe the content you'd like to generate.",
    },
    summarize: {
      title: "Summarize an article",
      prompt: "Paste the text of an article you would like summarized.",
    },
    refute: {
      title: "Refute an article",
      prompt: "Paste the text of an article you would like to argue against.",
    },
    technical: {
      title: "Provide a technical analysis",
      prompt:
        "Describe the topic you'd like to provide a technical analysis on.",
    },
  };

  const handleTaskChange = (e) => {
    setTask(e.target.value);
  };

  const handleTopicChange = (e) => {
    setTopic(e.target.value);
    setWordCount(
      e.target.value.split(/\s+/).filter(function (n) {
        return n != "";
      }).length
    );
  };

  const handleSubmit = async (e) => {
  console.log("handleSubmit function is running");
  e.preventDefault();
  console.log("Form values", {
    topic,
    keywords,
    task,
    postType,
    generateImage,
    imagePrompt,
  });

    
    const response = await fetch("/api/generatePost", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        topic,
        keywords,
        task,
        postType,
        generateImage,
        imagePrompt,
      }),
    });
    const json = await response.json();
    console.log("RESULTS", json);
    if (json?.post?.id) {
      router.push(`/post/${json.post.id}`);
    }
  };

  const taskOptions = Object.keys(tasks).map((taskKey) => (
    <option key={taskKey} value={taskKey}>
      {tasks[taskKey].title}
    </option>
  ));

  return (
    <div className="max-w-6xl mx-auto p-6 md:p-12 my-12 bg-white rounded-lg shadow-md w-4/5">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="text-lg font-semibold">Choose a task:</label>
          <select
            className="resize-none border-2 border-slate-500 w-full mt-2 p-4 rounded-lg shadow-sm"
            value={task}
            onChange={handleTaskChange}
          >
            {taskOptions}
          </select>
        </div>
        <div>
          <label className="text-lg font-semibold">
            {tasks[task]?.title || "Select a task first"}
          </label>
          <textarea
            className="resize-none border-2 border-slate-500 w-full h-20 mt-2 p-4 rounded-lg shadow-sm"
            value={topic}
            onChange={handleTopicChange}
            placeholder={
              tasks[task]?.prompt ||
              "The prompt will be updated based on the task chosen."
            }
          />
          <div>Word Count: {wordCount}</div>
        </div>
        <div>
          <label className="text-lg font-semibold">Using these keywords:</label>
          <textarea
            className="resize-none border-2 border-slate-500 w-full h-20 mt-2 p-4 rounded-lg shadow-sm"
            value={keywords}
            onChange={(e) => setKeywords(e.target.value)}
          />
        </div>
        <div>
          <label className="text-lg font-semibold">Choose a Post Type:</label>
          <select
            className="resize-none border-2 border-slate-500 w-full mt-2 p-4 rounded-lg shadow-sm"
            value={postType}
            onChange={(e) => setPostType(e.target.value)}
          >
            <option value="LinkedIn">LinkedIn</option>
  <option value="BlogPost">BlogPost</option>
  <option value="Twitter">Twitter</option>
            {/* Add or remove options based on your requirements */}
          </select>
        </div>
        <div className="flex items-center mt-2">
          <input
            type="checkbox"
            className="rounded-lg shadow-sm mr-2 text-indigo-600 focus:ring-indigo-500 h-5 w-5"
            checked={generateImage}
            onChange={(e) => setGenerateImage(e.target.checked)}
          />
          <label className="text-lg font-semibold">Generate an image</label>
        </div>
        <div className="pl-6">
          <label className="text-lg font-semibold">Image Prompt:</label>
          <input
            type="text"
            className="resize-none border-2 border-slate-500 w-full mt-2 p-4 rounded-lg shadow-sm"
            value={imagePrompt}
            onChange={(e) => setImagePrompt(e.target.value)}
            placeholder="Be specific. For ex: eighteen wheeler on a highway."
          />
        </div>

        <button
          type="submit"
          className="btn bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md focus:outline-none"
        >
          Generate
        </button>
      </form>
    </div>
  );
}

NewPost.getLayout = function getLayout(page, pageProps = {}) {
  console.log("pageProps in getLayout:", pageProps);
  const { posts = [] } = pageProps;
  return <AppLayout posts={posts}>{page}</AppLayout>;
};

export const getServerSideProps = withPageAuthRequired({
  getServerSideProps: async (context) => {
    console.log("getServerSideProps is running");

    const props = await getAppProps(context);

    console.log("Props from getAppProps:", props);

    return { props };
  },
});
