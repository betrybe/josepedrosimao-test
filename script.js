const API_SECRET = 'f9GoCyOk2qxhWArlwti36MgkWwzZtsZa';
const ENDPOINT = 'https://api.mercadolibre.com';

function createProductImageElement(imageSource) {
  const img = document.createElement('img');
  img.className = 'item__image';
  img.src = imageSource;
  return img;
}

function createCustomElement(element, className, innerText) {
  const e = document.createElement(element);
  e.className = className;
  e.innerText = innerText;
  return e;
}

function createProductItemElement({ sku, name, image }) {
  const section = document.createElement('section');
  section.className = 'item';

  section.appendChild(createCustomElement('span', 'item__sku', sku));
  section.appendChild(createCustomElement('span', 'item__title', name));
  section.appendChild(createProductImageElement(image));
  section.appendChild(createCustomElement('button', 'item__add', 'Adicionar ao carrinho!'));

  return section;
}

function getSkuFromProductItem(item) {
  return item.querySelector('span.item__sku').innerText;
}

function cartItemClickListener(event) {
  const { sku } = event.currentTarget.dataset;
  const cart = JSON.parse(localStorage.getItem('cart'));
  cart.forEach((item, index, object) => {
    if (item.sku === sku) {
      object.splice(index, 1);
    }
  });
  localStorage.setItem('cart', JSON.stringify(cart));
  event.currentTarget.remove();
}

function createCartItemElement({ sku, name, salePrice }) {
  const li = document.createElement('li');
  li.className = 'cart__item';
  li.dataset.sku = sku;
  li.innerText = `SKU: ${sku} | NAME: ${name} | PRICE: $${salePrice}`;
  li.addEventListener('click', cartItemClickListener);
  return li;
}

function addToCartListener(event) {
  const sku = getSkuFromProductItem(event.currentTarget.parentNode);
  fetch(`${ENDPOINT}/items/${sku}`)
    .then((response) => response.json())
    .then((data) => {
      const params = {
        sku: data.id,
        name: data.title,
        salePrice: data.price,
      };
      document.querySelector('.cart__items').append(createCartItemElement(params));
      let cart = JSON.parse(localStorage.getItem('cart'));
      if (!cart) cart = [];
      cart.push(params);
      localStorage.setItem('cart', JSON.stringify(cart));
    });
}

function loadProducts(query = 'caixa') {
  fetch(`${ENDPOINT}/sites/MLB/search?q=${query}`)
    .then((response) => response.json())
    .then((data) => {
      data.results.forEach((product) => {
        const params = {
          sku: product.id,
          name: product.title,
          image: product.thumbnail,
        };
        document.querySelector('.items').append(createProductItemElement(params));
      });
      document.querySelectorAll('.item__add').forEach(((button) => {
        button.addEventListener('click', addToCartListener);
      }));
    });
}

function loadCart() {
  let cart = JSON.parse(localStorage.getItem('cart'));
  if (!cart) cart = [];
  cart.forEach((product) => document.querySelector('.cart__items')
    .append(createCartItemElement(product)));
}

window.onload = () => {
  loadProducts();
  loadCart();
};
