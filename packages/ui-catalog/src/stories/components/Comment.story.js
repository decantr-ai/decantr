import { Comment } from '@decantr/ui/components';

export default {
  component: (props) => Comment(props),
  title: 'Comment',
  category: 'components/data-display',
  description: 'Threaded discussion component with nested replies, avatar, actions, and reply editor.',
  variants: [
    { name: 'Default', props: { author: 'Jane Doe', avatar: 'JD', content: 'This is a great feature!', datetime: '2 hours ago' } },
    { name: 'With Actions', props: {
      author: 'Alice',
      avatar: 'AJ',
      content: 'Really useful component.',
      datetime: '1 day ago',
      actions: [
        { label: 'Like', icon: 'heart', count: 5 },
        { label: 'Dislike', icon: 'thumbs-down', count: 0 },
      ],
    } },
    { name: 'Minimal Variant', props: { author: 'Bob', content: 'Simple comment', variant: 'minimal' } },
    { name: 'Bordered Variant', props: { author: 'Carol', avatar: 'CW', content: 'Bordered style', datetime: 'Just now', variant: 'bordered' } },
    { name: 'With Reply', props: {
      author: 'Dave',
      avatar: 'DB',
      content: 'What do you think?',
      datetime: '5 min ago',
      onReply: (text) => console.log('Reply:', text),
    } },
    { name: 'URL Avatar', props: { author: 'Eve', avatar: 'https://i.pravatar.cc/40', content: 'Avatar from URL', datetime: 'Today' } },
  ],
  playground: {
    defaults: { author: 'Jane Doe', avatar: 'JD', content: 'This is a comment.', datetime: '2 hours ago' },
    controls: [
      { name: 'author', type: 'text' },
      { name: 'avatar', type: 'text' },
      { name: 'content', type: 'text' },
      { name: 'datetime', type: 'text' },
      { name: 'variant', type: 'select', options: ['default', 'minimal', 'bordered'] },
    ],
  },
  usage: [
    {
      title: 'Basic comment',
      code: `import { Comment } from '@decantr/ui/components';

const comment = Comment({
  author: 'Alice',
  avatar: 'AJ',
  content: 'Great work!',
  datetime: '2 hours ago',
});
document.body.appendChild(comment);`,
    },
    {
      title: 'Nested replies',
      code: `import { Comment } from '@decantr/ui/components';

const thread = Comment(
  { author: 'Alice', content: 'What do you think?' },
  Comment({ author: 'Bob', content: 'Looks good!' }),
  Comment({ author: 'Carol', content: 'Agreed.' }),
);`,
    },
  ],
};
