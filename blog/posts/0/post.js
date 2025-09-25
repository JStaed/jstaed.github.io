const TITLE = 'About Me';
const CONTENT =
`
Hello!<br>
<br>

My name is Jane.
I'm a sophomore at Pennsylvania Western University on the Edinboro campus.<br>
I am studying Applied Computing with a concentration in Game Programming.<br>
In the Game Programming pathway, there are two paths, the art path and the writing path. I chose the art path.<br>
<br>

One of my goals in life is to be skilled at a large range of things.
So far, I have taken classes in computer programming, game development, 2D animation, 3D animation, digital photography, and graphic design.<br>
Outside of class, I study 2D and 3D art along with music and audio production.<br>
<br>

When I was young, I was asked many times what I wanted to be when I grow up.
I always said that I would be many things because I can't just choose one thing.
That's how I found my love of video game development.
The process of developing games allows me to work with several skillsets to complete a single product.<br>
<br>

Recently, I decided I wanted to combine all of my major skills into a single place.
And that's how this blog and portfolio site have come to be.
This website will be home to all of my major projects going forward.
And this blog will act as an archive for all of my creative endeavors.<br>
<br>

Interestingly enough, this website itself acts as the first display and the starting point of my skillsets combined.<br>
Thank you for visiting! I hope to share more of my work with you in the near future.<br>
<br>
`;

function LoadPage() {
    document.getElementById('postTitle').innerHTML = TITLE;
    document.getElementById('postContent').innerHTML = CONTENT;
}

LoadPage();