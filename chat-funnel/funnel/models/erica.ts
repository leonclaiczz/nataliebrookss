import type { Model } from './types';

const erica: Model = {
  id: 'erica',
  name: 'Erica Quinn',
  handle: 'ericaquinn',
  avatar: '/erica.jpg',
  pageTitle: '(1) Chat with Erica Quinn',
  bio: 'your favorite redhead next door 🏳️‍⚧️',
  memberSince: 'March 2024',
  followers: '9,318',
  country: 'USA',
  encryptedNote: true,
  ctaBar: 'Chat with me privately 💬',
  domains: ['ericaquinn.site', 'ericaquinn.online'],
  links: {
    default: 'https://www.fanvue.com/ericaquinn84/fv-5',
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
    { link: { title: 'Erica Quinn 🏳️‍⚧️', domain: 'my private page', image: '/erica-card.jpg', button: 'Open' } },
    { say: "👆 tap it babe, i'm waiting for you there" },
  ],
};

export default erica;
