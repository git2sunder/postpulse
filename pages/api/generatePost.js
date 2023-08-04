import { Configuration, OpenAIApi } from "openai";
import { withApiAuthRequired, getSession } from "@auth0/nextjs-auth0";
import { supabase } from "../../lib/supabaseClient";
import fetch from 'node-fetch'; // Import fetch


async function generateImage(prompt) { // Define the function for image generation
  const response = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`, 
    },
    body: JSON.stringify({
      prompt,
      n: 1,
      size: '256x256',
      response_format: 'url'
    })
  });

  const jsonResponse = await response.json();
  console.log(jsonResponse); // log the jsonResponse to see the structure


  if (jsonResponse.data && jsonResponse.data.length > 0) {
    const imageURL = jsonResponse.data[0].url; // get the URL

    const imageResponse = await fetch(imageURL); // fetch the image from the URL
    const buffer = await imageResponse.buffer(); // convert the response to a buffer

    const fileName = `image-${Date.now()}-${Math.floor(Math.random() * 1000)}.png`;


  const { error } = await supabase
  .storage
  .from('linkedin-bucket') // replace with your bucket name
  .upload(fileName, buffer, { contentType: 'image/png' });
    if (error) {
      throw new Error(`Error uploading image: ${error.message}`);
    }
    // Construct the URL of the image
    const imageUrl = `https://vestatbiuwpwlbebiruk.supabase.co/storage/v1/object/public/linkedin-bucket/${fileName}`;

    return imageUrl; // return the image path

  } else {
    throw new Error('Data extraction failed');
  }
  
}

export default withApiAuthRequired (async function handler(req, res) {

  let user;
  try {
    const session = await getSession(req, res);
    console.log('Session:', session); // Log the entire session object
    user = session?.user;
    if (!user) {
      res.status(401).send('User not authenticated');
      return;
    }
    // Rest of the code
  } catch (error) {
    console.error('Error getting session:', error);
    res.status(500).send('Error getting user session');
  }
  console.log('THE USER IS:', user.sub);

  const config = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
  });
  const openai = new OpenAIApi(config);

  const { topic, keywords, task, postType, generateImage: shouldGenerateImage , imagePrompt} = req.body;
  let imageUrlPromise = null;

  if (shouldGenerateImage && imagePrompt.trim() !== '') {  // If generateImage is true, start generating an image
    imageUrlPromise = generateImage(`An detailed, NO TEXT or LETTERS , no labels based picture representing the concept of ${imagePrompt}`); // you can modify this prompt according to your needs
  }


  let prompt;
  console.log('Post Type:', postType);
  console.log('Task is', task )
  switch(task){
    case "expand":
      switch(postType) {
        case "LinkedIn":
          prompt = `You have a brief idea: ${topic}. Your task is to expand this idea into a comprehensive discussion that integrates the following keywords: ${keywords}. This expanded idea should be suitable for a detailed LinkedIn post.`;
          break;
        case "BlogPost":
          prompt = `You have a brief idea: ${topic}. Your task is to expand this idea into a comprehensive discussion that integrates the following keywords: ${keywords}. This expanded idea should be suitable for a detailed blog post.`;
          break;
        case "Twitter":
          prompt = `You have a brief idea: ${topic}. Your task is to expand this idea into a concise discussion that integrates the following keywords: ${keywords}. This expanded idea should be suitable for a Twitter post.`;
          break;
        default:
          throw new Error('Invalid post type');
      }
      break;
    case "critique":
      switch(postType) {
        case "LinkedIn":
          prompt = `The following presents an argument: ${topic}. Your task is to provide a detailed critique of this argument, incorporating these keywords: ${keywords}. Ensure your critique is suitable for a LinkedIn post.`;
          break;
        case "BlogPost":
          prompt = `The following presents an argument: ${topic}. Your task is to provide a detailed critique of this argument, incorporating these keywords: ${keywords}. Ensure your critique is suitable for a blog post.`;
          break;
        case "Twitter":
          prompt = `The following presents an argument: ${topic}. Your task is to provide a concise critique of this argument, incorporating these keywords: ${keywords}. Ensure your critique is suitable for a Twitter post.`;
          break;
        default:
          throw new Error('Invalid post type');
      }
      break;
    case "tutorial":
      switch(postType) {
        case "LinkedIn":
          prompt = `Create a detailed, step-by-step tutorial on the topic: ${topic}. This tutorial should include these keywords: ${keywords}. Ensure this tutorial is suitable for a LinkedIn post.`;
          break;
        case "BlogPost":
          prompt = `Create a detailed, step-by-step tutorial on the topic: ${topic}. This tutorial should include these keywords: ${keywords}. Ensure this tutorial is suitable for a blog post.`;
          break;
        case "Twitter":
          prompt = `Create a concise, step-by-step tutorial on the topic: ${topic}. This tutorial should include these keywords: ${keywords}. Ensure this tutorial is suitable for a Twitter post.`;
          break;
        default:
          throw new Error('Invalid post type');
      }
      break;
    case "content":
      switch(postType) {
        case "LinkedIn":
          prompt = `Create original content on the topic: ${topic}. Incorporate these keywords into your content: ${keywords}. Ensure the content is engaging and suitable for a LinkedIn post.`;
          break;
        case "BlogPost":
          prompt = `Create original content on the topic: ${topic}. Incorporate these keywords into your content: ${keywords}. Ensure the content is engaging and suitable for a blog post.`;
          break;
        case "Twitter":
          prompt = `Create concise original content on the topic: ${topic}. Incorporate these keywords into your content: ${keywords}. Ensure the content is engaging and suitable for a Twitter post.`;
          break;
        default:
          throw new Error('Invalid post type');
      }
      break;
    case "summarize":
      switch(postType) {
        case "LinkedIn":
          prompt = `Here is an article: ${topic}. Summarize the article concisely while incorporating these keywords: ${keywords}. The summary should be suitable for a LinkedIn post.`;
          break;
        case "BlogPost":
          prompt = `Here is an article: ${topic}. Summarize the article concisely while incorporating these keywords: ${keywords}. The summary should be suitable for a blog post.`;
          break;
        case "Twitter":
          prompt = `Here is an article: ${topic}. Summarize the article in a few sentences while incorporating these keywords: ${keywords}. The summary should be suitable for a Twitter post.`;
          break;
        default:
          throw new Error('Invalid post type');
      }
      break;
    case "refute":
      switch(postType) {
        case "LinkedIn":
          prompt = `Here is an article: ${topic}. Construct a detailed, logical argument against it incorporating these keywords: ${keywords}. Ensure your argument is suitable for a LinkedIn post.`;
          break;
        case "BlogPost":
          prompt = `Here is an article: ${topic}. Construct a detailed, logical argument against it incorporating these keywords: ${keywords}. Ensure your argument is suitable for a blog post.`;
          break;
        case "Twitter":
          prompt = `Here is an article: ${topic}. Construct a concise, logical argument against it incorporating these keywords: ${keywords}. Ensure your argument is suitable for a Twitter post.`;
          break;
        default:
          throw new Error('Invalid post type');
      }
      break;
    case "technical":
      switch(postType) {
        case "LinkedIn":
          prompt = `Provide a detailed, technical analysis of the following: ${topic}. Be sure to include these keywords in your analysis: ${keywords}. The analysis should be suitable for a LinkedIn post.`;
          break;
        case "BlogPost":
          prompt = `Provide a detailed, technical analysis of the following: ${topic}. Be sure to include these keywords in your analysis: ${keywords}. The analysis should be suitable for a blog post.`;
          break;
        case "Twitter":
          prompt = `Provide a concise, technical analysis of the following: ${topic}. Be sure to include these keywords in your analysis: ${keywords}. The analysis should be suitable for a Twitter post.`;
          break;
        default:
          throw new Error('Invalid post type');
      }
      break;
  default:
    throw new Error('Invalid post type');
}

  if (!topic || !keywords) {
    res.status(422);
    return;
  }

  if (topic.length > 70000 || keywords.length > 80) {
    res.status(422);
    return;
  }

  

  const postContentResultPromise = await openai.createChatCompletion({
    model: 'gpt-4',
    messages: [
      {
        role: 'system',
        content: 'You are a linked in content generator.',
      },
      {
        role: 'user',
        content: prompt,
      },
    ],
    temperature: 0,
  });
  const [postContentResult, imageUrl] = await Promise.all([postContentResultPromise, imageUrlPromise]); // wait for both promises to finish

  const postContent = postContentResult.data.choices[0]?.message.content;

  const titleResult = await openai.createChatCompletion({
    model: 'gpt-4',
    messages: [
      {
        role: 'system',
        content: 'You are a linkedin content generator.',
      },
      {
        role: 'user',
        content: prompt,
      },
      {
        role: 'assistant',
        content: postContent,
      },
      {
        role: 'user',
        content: 'Generate appropriate title tag text for the above linkedin post',
      },
    ],
    temperature: 0,
  });

  const metaDescriptionResult = await openai.createChatCompletion({
    model: 'gpt-4',
    messages: [
      {
        role: 'system',
        content: 'You are a linkedin post generator.',
      },
      {
        role: 'user',
        content: prompt,
      },
      {
        role: 'assistant',
        content: postContent,
      },
      {
        role: 'user',
        content:
          'Generate SEO-friendly meta description content for the above linkedin post',
      },
    ],
    temperature: 0,
  });

  const title = titleResult.data.choices[0]?.message.content;
  const metaDescription =
    metaDescriptionResult.data.choices[0]?.message.content;

  console.log('POST CONTENT: ', postContent);
  console.log('TITLE: ', title);
  console.log('META DESCRIPTION: ', metaDescription);
  console.log('THE USER IS:', user.sub);
  console.log('the IMAGE URL is', imageUrl);

  try {
    const { data, error } = await supabase
      .from('Posts')
      .insert([
        { title: title, post: postContent, user_id: user.sub , topic: topic, keywords: keywords , post_type: postType, image:imageUrl},
      ])
      .select();
  
    if (error) {
      console.error('Error inserting post: ', error);
      console.error('Detailed error: ', error.response?.data); // Print entire error object
      res.status(500).send('Error when inserting chat completion: ', error);
    } else {
      
      res.status(200).json ({
        
        post: {
          id: data[0].id
          
        },
      });
      console.log('Response back to new sent  successfully: ');
    }
  } catch (err) {
    console.error(err);
    res.status(500).send('An unexpected error occurred.');
  }

 
})