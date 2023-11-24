import productApi from '../api/productApi';
import { renderProductCard } from './product-card';
import { toast } from './toast';

export const urlServer = 'http://localhost/laptopEcommerce-server';

export const filterList = [
  {
    ma: 'thuong_hieu',
    ten: 'thương hiệu',
  },
  {
    ma: 'series_laptop',
    ten: 'series laptop',
  },
  {
    ma: 'mau_sac',
    ten: 'màu sắc',
  },
  {
    ma: 'series_cpu',
    ten: 'series CPU',
  },
  {
    ma: 'chip_do_hoa_roi',
    ten: 'chip đồ họa rời',
  },
  {
    ma: 'dung_luong_ram',
    ten: 'dung lượng RAM',
  },
  {
    ma: 'khoi_luong',
    ten: 'khối lượng',
  },
];

export const priceGap = 0;
export const priceGapMobile = 0;

export let max;

export function renderLoadingManager(row = 1, col = 1) {
  let loadingHTML = '';
  let colHTML = '';

  for (let i = 1; i <= col; i++) {
    colHTML += `
      <td style="width: 50%;">
        <div class="skeleton skeleton-text__table"></div>
      </td>
    `;
  }

  for (let i = 1; i <= row; i++) {
    loadingHTML += `
      <tr>
        ${colHTML}
      </tr>
    `;
  }

  return loadingHTML;
}

export async function initFilter() {
  const rangeInputList = $('.price-range-input input');
  const rangeInputMobileList = $('.price-range-input-mobile input');
  try {
    const { data } = await productApi.getAll();
    data.forEach((product) => {
      if (!max) {
        max = product['gia_goc'];
      } else if (max < product['gia_goc']) {
        max = product['gia_goc'];
      }
    });

    rangeInputList[0].setAttribute('min', 0);
    rangeInputList[0].setAttribute('max', max);

    rangeInputList[1].setAttribute('min', 0);
    rangeInputList[1].setAttribute('max', max);

    rangeInputMobileList[0].setAttribute('min', 0);
    rangeInputMobileList[0].setAttribute('max', max);

    rangeInputMobileList[1].setAttribute('min', 0);
    rangeInputMobileList[1].setAttribute('max', max);
  } catch (error) {
    console.log(error.message);
  }

  const queryParams = new URLSearchParams(window.location.search);

  filterList.forEach((filter) => {
    if (queryParams.has(filter.ma)) {
      const query = queryParams.get(filter.ma);
      let queryArr;
      if (query.includes('%')) {
        queryArr = query.split('%');
      } else {
        queryArr = [query];
      }

      queryArr.forEach((item) => {
        $(`input#${item}`).prop('checked', true);
        $(`input#mobile-${item}`).prop('checked', true);
      });
    }
  });

  if (queryParams.has('name')) {
    $('.header-input').val(queryParams.get('name'));
  }

  if (queryParams.has('sort')) {
    $(`.search-filter label[for="${queryParams.get('sort')}"]`).addClass('active');
  }

  if (queryParams.has('min_price')) {
    const minVal = Number(queryParams.get('min_price'));
    const min = convertCurrency(minVal);

    $('.input-min').val(min);
    $('.range-min').val(minVal);

    $('.input-min-mobile').val(min);
    $('.range-min-mobile').val(minVal);

    rangeInputList[0].value = minVal;
    rangeInputMobileList[0].value = minVal;

    let percentLeft = (minVal / rangeInputList[0].max) * 100;
    let percentMobileLeft = (minVal / rangeInputMobileList[0].max) * 100;

    $('.price-progress').css({
      left: percentLeft + '%',
    });

    $('.price-progress-mobile').css({
      left: percentMobileLeft + '%',
    });
  } else {
    rangeInputList[0].value = 0;
    rangeInputMobileList[0].value = 0;

    $('.price-input input')[0].value = convertCurrency(0);
    $('.price-input-mobile input')[0].value = convertCurrency(0);
  }

  if (queryParams.has('max_price')) {
    const maxVal = Number(queryParams.get('max_price'));
    const max = convertCurrency(maxVal);

    $('.input-max').val(max);
    $('.range-max').val(maxVal);

    $('.input-max-mobile').val(max);
    $('.range-max-mobile').val(maxVal);

    let percentRight = 100 - (maxVal / rangeInputList[1].max) * 100;
    let percentMobileRight = 100 - (maxVal / rangeInputMobileList[1].max) * 100;

    $('.price-progress').css({
      right: percentRight + '%',
    });

    $('.price-progress-mobile').css({
      right: percentMobileRight + '%',
    });
  } else {
    rangeInputList[1].value = max;
    rangeInputMobileList[1].value = max;

    $('.price-input input')[1].value = convertCurrency(max);
    $('.price-input-mobile input')[1].value = convertCurrency(max);
  }
}

export function renderProductSearch(data) {
  if (!data) return;
  const productHTML = data
    .map((product) => {
      const productCardHTML = renderProductCard(product);

      return `
        <div class="col-12 col-sm-6 col-md-4 col-lg-3">
          ${productCardHTML}
        </div>`;
    })
    .join('');

  $('.search-product .row').html(productHTML);
}

export function getLocalStorage(key) {
  return JSON.parse(window.localStorage.getItem(key));
}

export function setLocalStorage(key, value) {
  window.localStorage.setItem(key, JSON.stringify(value));
}

export function renderCartList(cartList) {
  if (!cartList || cartList?.length <= 0) {
    $('.action-cart_empty').removeClass('hidden');
    $('.action-cart_container').addClass('hidden');
    $('.action-title.cart').html('Giỏ hàng của bạn<br>(0) sản phẩm');
    return;
  }

  $('.action-cart_empty').addClass('hidden');
  $('.action-cart_container').removeClass('hidden');

  const cartHTML = cartList.map((cart) => {
    let price;
    if (cart['giam_gia']) {
      price = cart['gia_goc'] - (cart['gia_goc'] * cart['giam_gia']) / 100;
    } else {
      price = cart['gia_goc'];
    }

    price = convertCurrency(price);

    return `
        <li class="action-cart_item">
          <div class="action-cart_item-image">
            <img
              src="${urlServer}/images/${cart['hinh_anh']}"
              alt="${cart['ten_san_pham']}">
          </div>
          <div class="action-cart_item-info">
            <a href="/product-detail.html?id=${cart['ma_san_pham']}">
              ${cart['ten_san_pham']}
            </a>
            <p>Số lượng: ${cart['so_luong']}</p>
            <h4>${price}</h4>
          </div>
        </li>
      `;
  });

  let totalPrice = cartList.reduce((prev, curr) => {
    let price;
    if (curr['giam_gia']) {
      price = curr['gia_goc'] - (curr['gia_goc'] * curr['giam_gia']) / 100;
    } else {
      price = curr['gia_goc'];
    }
    return prev + price * curr['so_luong'];
  }, 0);

  totalPrice = convertCurrency(totalPrice);

  $('.action-cart_top').html(cartHTML);

  $('.action-cart_total p').html(`
    Tổng tiền (${cartList.length}) sản phẩm
  `);

  $('.action-title.cart').html(`
    Giỏ hàng của bạn<br>(${cartList.length}) sản phẩm
  `);

  $('.action-cart_total span').html(totalPrice);
}

export async function initCartList() {
  const cartList = getLocalStorage('cartList');
  renderCartList(cartList);
}

export function initHeader() {
  const accessToken = getLocalStorage('access_token');
  initCartList();

  if (!accessToken) {
    $('.auth').removeClass('hidden');
    $('.logged').addClass('hidden');
    $('.logout').addClass('hidden');
    $('.action-link.manager').addClass('hidden');
    return;
  }

  $('.auth').addClass('hidden');
  $('.logout').removeClass('hidden');

  const token = parseJwt(accessToken);
  const now = parseInt(Date.now() / 1000);

  $('.logged img').attr('src', `${urlServer}/images/` + token.data.infor.avatar);
  $('.logged').removeClass('hidden');

  if (now > token.exp) {
    setLocalStorage('access_token', null);
    setLocalStorage('user', null);
    window.location.href = '/';
    return;
  }

  if (token.data.role['ma_nhom_quyen'] !== 0) {
    window.location.href = '/manager.html';
  }

  setLocalStorage('user', token.data);

  $('.action-logged .action-title p').html(token.data.infor['ten_khach_hang']);
}

export function parseJwt(token) {
  if (!token) return null;

  var base64Url = token.split('.')[1];
  var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  var jsonPayload = decodeURIComponent(
    window
      .atob(base64)
      .split('')
      .map(function (c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      })
      .join('')
  );

  return JSON.parse(jsonPayload);
}

export function debounce(func, timeout = 300) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      func.apply(this, args);
    }, timeout);
  };
}

export function convertCurrency(value) {
  return value.toLocaleString('it-IT', {
    style: 'currency',
    currency: 'VND',
  });
}

export function isAccessAction(perName, actionName) {
  const accessToken = getLocalStorage('access_token');

  const data = parseJwt(accessToken);

  if (parseInt(Date.now() / 1000) > data.exp) {
    setLocalStorage('user', null);
    setLocalStorage('access_token', null);
    window.location.href = '/';
    return false;
  }

  const { data: user } = data;

  if (!user) return false;

  const permissionList = user.permission;

  if (!permissionList || permissionList?.length <= 0) return false;

  const permission = permissionList.findIndex(
    (per) =>
      per['ten_quyen_hang'] === perName &&
      per['ten_chuc_nang'] === actionName &&
      per['trang_thai_quyen_hang'] === true
  );

  if (permission !== -1) {
    return true;
  }

  toast({
    title: 'Không có quyền thực hiện hành động này',
    type: 'warning',
    duration: 2000,
  });

  return false;
}
