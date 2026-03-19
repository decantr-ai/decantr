import { tags } from 'decantr/tags';
import { createSignal } from 'decantr/state';
import { Card, Input, Button } from 'decantr/components';

const { div, h1, p, form, label, textarea } = tags;

export function ContactPage() {
  const [name, setName] = createSignal('');
  const [email, setEmail] = createSignal('');
  const [message, setMessage] = createSignal('');

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted:', { name: name(), email: email(), message: message() });
  };

  return div({ class: '_py12 _px6 _maxw[600px] _mx[auto]' },
    h1({ class: '_fs3xl _fwbold _mb4' }, 'Get in Touch'),
    p({ class: '_fgmuted _mb8' },
      'Have a project in mind? I would love to hear from you. Send me a message and I will get back to you as soon as possible.'
    ),

    Card({
      children: Card.Body({},
        form({ onSubmit: handleSubmit, class: '_flex _col _gap6' },
          div({ class: '_flex _col _gap2' },
            label({ class: '_fwmedium' }, 'Name'),
            Input({
              value: name,
              onInput: (e) => setName(e.target.value),
              placeholder: 'Your name',
            }),
          ),
          div({ class: '_flex _col _gap2' },
            label({ class: '_fwmedium' }, 'Email'),
            Input({
              type: 'email',
              value: email,
              onInput: (e) => setEmail(e.target.value),
              placeholder: 'your@email.com',
            }),
          ),
          div({ class: '_flex _col _gap2' },
            label({ class: '_fwmedium' }, 'Message'),
            textarea({
              value: message,
              onInput: (e) => setMessage(e.target.value),
              placeholder: 'Tell me about your project...',
              class: '_p3 _bgsurface _bcborder _b _rounded _minh[150px] _resize[vertical]',
              rows: 5,
            }),
          ),
          Button({ type: 'submit', variant: 'primary', class: '_w[full]' }, 'Send Message'),
        )
      ),
    })
  );
}
