import { tags } from 'decantr/tags';
import { link } from 'decantr/router';
import { Card, Button } from 'decantr/components';
import { cart, setCart } from '../app.js';

const { div, h1, span, a } = tags;

function updateQuantity(id, delta) {
  const item = cart.items.find(i => i.id === id);
  if (item) {
    const newQty = item.quantity + delta;
    if (newQty <= 0) {
      setCart('items', items => items.filter(i => i.id !== id));
    } else {
      setCart('items', i => i.id === id, 'quantity', newQty);
    }
    updateTotal();
  }
}

function updateTotal() {
  const total = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  setCart('total', total);
}

export function CartPage() {
  const isEmpty = () => cart.items.length === 0;

  return div({ class: '_py12 _px6 _maxw[800px] _mx[auto]' },
    h1({ class: '_fs3xl _fwbold _mb8' }, 'Shopping Cart'),

    () => isEmpty()
      ? Card({
          class: '_p8 _textcenter',
          children: [
            div({ class: '_fgmuted _mb4' }, 'Your cart is empty'),
            a({ ...link('/catalog') },
              Button({ variant: 'primary' }, 'Continue Shopping')
            ),
          ],
        })
      : div({ class: '_flex _col _gap4' },
          // Cart items
          ...cart.items.map(item =>
            Card({
              class: '_p4',
              children: div({ class: '_flex _justifybetween _itemscenter' },
                div({ class: '_flex _gap4 _itemscenter' },
                  div({ class: '_w16 _h16 _bgsurface _rounded _flex _itemscenter _justifycenter _fgmuted' },
                    'Img'
                  ),
                  div({},
                    div({ class: '_fwbold' }, item.name),
                    div({ class: '_fgmuted _fssm' }, `$${item.price} each`),
                  ),
                ),
                div({ class: '_flex _gap4 _itemscenter' },
                  div({ class: '_flex _itemscenter _gap2' },
                    Button({ size: 'sm', variant: 'outline', onClick: () => updateQuantity(item.id, -1) }, '-'),
                    span({ class: '_w8 _textcenter' }, item.quantity),
                    Button({ size: 'sm', variant: 'outline', onClick: () => updateQuantity(item.id, 1) }, '+'),
                  ),
                  span({ class: '_fwbold _w20 _textright' }, `$${item.price * item.quantity}`),
                ),
              ),
            })
          ),

          // Total
          Card({
            class: '_p4 _mt4',
            children: div({ class: '_flex _justifybetween _itemscenter' },
              span({ class: '_fslg _fwbold' }, 'Total'),
              span({ class: '_fs2xl _fwbold _fgprimary' }, () => `$${cart.total}`),
            ),
          }),

          // Checkout button
          Button({ variant: 'primary', size: 'lg', class: '_w[full] _mt4' }, 'Proceed to Checkout'),
        )
  );
}
