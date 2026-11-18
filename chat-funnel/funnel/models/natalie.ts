import type { Model } from './types';

const natalie: Model = {
  id: 'natalie',
  name: 'Natalie Brooks',
  handle: 'nataliebrooks',
  avatar: '/natalie.jpg',
  pageTitle: '(1) Chat with Natalie Brooks',
  bio: 'your favorite girl from newport beach 🏳️‍⚧️',
  memberSince: 'May 2024',
  followers: '6,742',
  country: 'USA',
  encryptedNote: true,
  ctaBar: 'Chat with me privately 💬',
  domains: [], // z.B. 'nataliebrooks.site'
  links: {
    default: 'https://www.fanvue.com/nataliebrookss_/fv-14',
  },
  flow: [
    { say: 'did you find me on instagram? 😍' },
    { wait: true },
    { say: 'ha, i knew it. like what you saw?' },
    { wait: true },
    { say: 'hmm okay. want to see more though?' },
    { wait: true },
    { say: "glad you think so. been a busy day over here. i'm almost never on here, but on my private page i answer every single day." },
    { say: "i can't wait to show you my surprise 🏳️‍⚧️😏" },
    { link: { title: 'Natalie Brooks 🏳️‍⚧️', domain: 'my private page', image: '/natalie-card.jpg', button: 'Open' } },
    { say: "👆 tap it babe, i'm waiting for you there" },
  ],
};

export default natalie;
