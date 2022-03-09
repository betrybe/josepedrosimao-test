const ENDPOINT = 'https://api.mercadolibre.com';
const CART_ITEMS_CLASS = '.cart__items';

function createProductImageElement(imageSource) {
  const img = document.createElement('img');
  img.className = 'item__image';
  img.src = imageSource;
  return img;
}

function createCustomElement(element, className, innerText = '') {
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
  const itemAdd = createCustomElement('button', 'item__add');
  const addButton = document.createElement('span');
  addButton.className = 'material-icons-outlined';
  addButton.innerText = 'add_shopping_cart';
  addButton.title = 'Adicionar ao carrinho';
  itemAdd.appendChild(addButton);
  section.appendChild(itemAdd);

  return section;
}

function getSkuFromProductItem(item) {
  return item.querySelector('span.item__sku').innerText;
}

function sumTotalPrice() {
  let cart = JSON.parse(localStorage.getItem('cart'));
  let sum = 0;
  if (!cart) cart = [];
  cart.forEach((product) => {
    sum += product.salePrice;
  });
  document.querySelector('.total-price').innerText = sum;
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
  sumTotalPrice();
}

function createCartItemElement({ sku, name, salePrice }) {
  const li = document.createElement('li');
  li.className = CART_ITEMS_CLASS;
  li.dataset.sku = sku;
  li.innerText = `SKU: ${sku} | NAME: ${name} | PRICE: $${salePrice}`;
  li.addEventListener('click', cartItemClickListener);
  return li;
}

function makeRequest(path) {
  const navbar = document.querySelector('#navbar');
  navbar.parentNode
    .insertBefore(createCustomElement('p', 'loading', 'Loading...'), navbar.nextSibling);
  return new Promise((resolve, reject) => {
    fetch(path).then((response) => {
      const result = response.json();
      document.querySelector('.loading').remove();
      resolve(result);
    }).catch((error) => {
      document.querySelector('.loading').remove();
      const errorMsg = createCustomElement('p', 'error', 'Erro ao executar requisição');
      document.querySelector('body').prepend(errorMsg);
      reject(error);
    });
  });
}

function addToCartListener(event) {
  const sku = getSkuFromProductItem(event.currentTarget.parentNode);
  makeRequest(`${ENDPOINT}/items/${sku}`).then((data) => {
    const params = {
      sku: data.id,
      name: data.title,
      salePrice: data.price,
    };
    document.querySelector(CART_ITEMS_CLASS).append(createCartItemElement(params));
    let cart = JSON.parse(localStorage.getItem('cart'));
    if (!cart) cart = [];
    cart.push(params);
    localStorage.setItem('cart', JSON.stringify(cart));
    sumTotalPrice();
  });
}

function emptyCartListener() {
  localStorage.removeItem('cart');
  document.querySelector(CART_ITEMS_CLASS).innerHTML = '';
  sumTotalPrice();
}

function loadProducts(query = 'caixa') {
  document.querySelector('.items').innerHTML = '';
  makeRequest(`${ENDPOINT}/sites/MLB/search?q=${query}`).then((data) => {
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
  cart.forEach((product) => document.querySelector(CART_ITEMS_CLASS)
    .append(createCartItemElement(product)));
  sumTotalPrice();
}

window.onload = () => {
  loadProducts();
  loadCart();
  sumTotalPrice();
  document.querySelector('.empty-cart').addEventListener('click', emptyCartListener);
  document.querySelector('#search-btn').addEventListener('click', (event) => {
    event.preventDefault();
    loadProducts(document.querySelector('#query').value);
  });
};
