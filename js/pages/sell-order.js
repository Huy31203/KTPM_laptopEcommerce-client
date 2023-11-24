import moment from 'moment';
import orderApi from '../api/orderApi';
import { toast } from '../utils/toast';
import {
  convertCurrency,
  getLocalStorage,
  isAccessAction,
  renderLoadingManager,
  urlServer,
} from '../utils/constains';
import customerApi from '../api/customerApi';
import guaranteeApi from '../api/guaranteeApi';
import productApi from '../api/productApi';
import detailOrderApi from '../api/detailOrderApi';

function initSellOrder() {
  const now = new Date();
  const date = new Date();

  date.setMonth(date.getMonth() - 1);

  $('input[name="sell-order-daterange"]').val(
    `${moment(date).format('L')} - ${moment(now).format('L')}`
  );

  const from = Math.floor(date.getTime() / 1000);
  const to = Math.floor(now.getTime() / 1000);

  const url = new URL(window.location);
  url.searchParams.set('from', from);
  url.searchParams.set('to', to);
  history.pushState({}, '', url);
}

export async function renderSellOrder(params = '') {
  try {
    const sellOrderList = await orderApi.getAll(params);

    if (sellOrderList.length <= 0) {
      $('.sell-order-content').html(`
        <tr>
          <td colspan="4">
            <h1 class="text-center my-5 w-100">Không có đơn hàng nào cả!!!</h1>  
          </td>
        </tr>
      `);
      return;
    }

    const sellOrderHTML = sellOrderList.map((order) => {
      let status;

      switch (order['trang_thai']) {
        case 'chờ xử lý':
          status = 'wait';
          break;
        case 'hoàn thành':
          status = 'completed';
          break;
        case 'đang giao hàng':
          status = 'shipping';
          break;
        case 'đã hủy':
          status = 'canceled';
          break;
      }

      return `
        <tr align="center">
          <td>
            ${order['ma_don_hang']}
          </td>
          <td>
            <span
              class="sell-order-status ${status}"
              data-id="${order['ma_don_hang']}"
              data-value="${order['trang_thai']}"
            >
              ${order['trang_thai']}
            </span>
          </td>
          <td>
            <span class="sell-order-time">
              ${moment(order['thoi_gian_dat_mua']).format('L')}
            </span>
          </td>
          <td>
            <i class="fa-solid fa-circle-info admin-action viewmore text-primary" data-id="${
              order['ma_don_hang']
            }"></i>
          </td>
        </tr>
      `;
    });

    $('.sell-order-content').html(sellOrderHTML);

    $('.sell-order-status').click((e) => {
      if (!isAccessAction('orders', 'UPDATE')) return;

      if (e.target.dataset.value === 'hoàn thành' || e.target.dataset.value === 'đã hủy') return;

      $('#statusModal').modal('show');
      $('#statusModal').attr('data-id', e.target.dataset.id);
    });

    $('.sell-order .admin-action.viewmore').click(async (e) => {
      $('#viewmoreSellOrderModal').modal('show');
      $('#viewmoreSellOrderModal').attr('data-id', e.target.dataset.id);
      await handleUpdateOrder(e.target.dataset.id);
    });
  } catch (error) {
    console.log(error.message);
  }
}

$('.modal-status .sell-order-status').click(async (e) => {
  if (!isAccessAction('orders', 'UPDATE')) return;

  try {
    const value = e.target.dataset.value;
    const id = $('#statusModal').attr('data-id');

    await orderApi.update({
      ma_don_hang: id,
      trang_thai: value,
    });

    const url = new URL(window.location);
    const searching = url.searchParams.get('searching') ?? '';
    const from = url.searchParams.get('from') ?? null;
    const to = url.searchParams.get('to') ?? null;
    const sortNameVal = url.searchParams.get('sort-name') ?? '';
    const sortActionVal = url.searchParams.get('sort-action') ?? '';

    renderSellOrder({
      sortAction: sortActionVal,
      sortName: sortNameVal,
      searching,
      from,
      to,
    });

    const data = await orderApi.getById(id);

    const productList = data['danh_sach_san_pham_da_mua'];

    const userId = data['ma_khach_hang'];
    const { userId: employeeId } = getLocalStorage('user');

    if (value === 'hoàn thành') {
      const now = new Date();

      await orderApi.update({
        ma_don_hang: id,
        ma_nhan_vien: employeeId,
      });

      productList.forEach(async (product) => {
        const [productDetailList] = await detailOrderApi.getById(id, product['ma_san_pham']);

        const expire = new Date();

        expire.setMonth(expire.getMonth() + product['thoi_gian_bao_hanh']);

        productDetailList.forEach(async (productDetail) => {
          await guaranteeApi.add({
            ma_chi_tiet_san_pham: productDetail['ma_chi_tiet_san_pham'],
            ma_khach_hang: userId,
            ngay_lap: now.getTime(),
            ngay_het_han: expire.getTime(),
          });
        });

        const data = await productApi.getById(product['ma_san_pham']);

        await productApi.update({
          ma_san_pham: product['ma_san_pham'],
          so_luong_da_ban: data['so_luong_da_ban'] + product['so_luong_da_mua'],
        });
      });
    }

    toast({
      type: 'success',
      title: 'Thay đổi trạng thái thành công',
      duration: 2000,
    });
  } catch (error) {
    toast({
      type: 'error',
      title: 'Thay đổi trạng thái không thành công',
      duration: 2000,
    });
  } finally {
    $('#statusModal').modal('hide');
  }
});

async function handleUpdateOrder(id) {
  try {
    $('#viewmoreSellOrderModal').attr('data-id', id);
    $('#viewmoreSellOrderModal').modal('show');

    const order = await orderApi.getById(id);

    const customer = await customerApi.getById(order['ma_khach_hang']);

    $('#fullname').val(customer['ten_khach_hang']);
    $('#phone').val(customer['so_dien_thoai']);
    $('#address').val(customer['dia_chi']);
    $('#employee').val(order['ma_nhan_vien']);
    $('#pay-method').val(order['hinh_thuc_thanh_toan']);

    const productListHMTL = order['danh_sach_san_pham_da_mua'].map((product) => {
      let price, newPrice, oldPrice;

      oldPrice = convertCurrency(product['don_gia']);

      if (product['giam_gia_san_pham']) {
        newPrice = product['don_gia'] - (product['don_gia'] * product['giam_gia_san_pham']) / 100;
        newPrice = convertCurrency(newPrice);

        price = `
            <p class="product-new-price">${newPrice} x ${product['so_luong_da_mua']}</p>
            <div class="product-sale">
              <s class="product-old-price">${oldPrice}</s>
              <p class="product-percent">-${product['giam_gia_san_pham']}%</p>
            </div>
          `;
      } else {
        price = `<p class="product-new-price">${oldPrice} x ${product['so_luong_da_mua']}</p>`;
      }

      return `
          <div class="product-item">
            <div class="product-info">
              <div class="product-img">
                <img
                  src="${urlServer}/images/${product['hinh_anh']}"
                  alt="${product['ten_san_pham']}"
                />
              </div>
              <div class="product-content">
                <a href="./product-detail.html?id=${product['ma_san_pham']}" class="product-title">${product['ten_san_pham']}</a>
                ${price}
              </div>
            </div>
          </div>
        `;
    });

    $('#viewmoreSellOrderModal .product-list').html(productListHMTL);
    $('#viewmoreSellOrderModal .order-time span').html(
      moment(order['thoi_gian_dat_mua']).format('L')
    );

    let status;
    switch (order['trang_thai']) {
      case 'chờ xử lý':
        status = 'waiting';
        break;
      case 'đang giao hàng':
        status = 'shipping';
        break;
      case 'hoàn thành':
        status = 'completed';
        break;
      case 'đã hủy':
        status = 'canceled';
        break;
    }
    $('.order-status').html(`
      Trạng thái: <span class="${status}">${order['trang_thai']}</span>
    `);

    let totalPay = convertCurrency(order['tong_tien']);

    $('#viewmoreSellOrderModal .order-total-price span').html(totalPay);
  } catch (error) {
    console.log(error.message);
  }
}

export function renderOrderPage() {
  const loadingHTML = renderLoadingManager(18, 4);

  $('.admin-content').html(`
    <div class="sell-order">
      <div class="sell-order-header">
        <h1>Đơn hàng</h1>
        <input type="text" name="sell-order-daterange" value="" />
      </div>
      <div class="search-container">
        <div class="search-box">
          <input type="text" class="header-input" placeholder="Tìm kiếm theo mã đơn hàng" />
          <button type="button" class="btn primary btn-header">
            <i class="fa-solid fa-magnifying-glass"></i>
          </button>
        </div>
      </div>
      <div class="sell-order-table-container">
        <table class="sell-order-table">
          <thead>
            <tr align="center">
              <th>
                <div class="d-flex align-items-center justify-content-center gap-3 ">
                  Mã đơn hàng
                  <div class="icon-sort active before" data-value="ma_don_hang" data-sort="desc"></div>
                </div>
              </th>
              <th>
                <div class="d-flex align-items-center justify-content-center gap-3 ">
                  Trạng thái
                  <div class="icon-sort" data-value="trang_thai" data-sort="desc"></div>
                </div>
              </th>
              <th>
                <div class="d-flex align-items-center justify-content-center gap-3 ">
                  Thời gian
                  <div class="icon-sort" data-value="thoi_gian_dat_mua" data-sort="desc"></div>
                </div>
              </th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody class="sell-order-content">
            ${loadingHTML}
          </tbody>
        </table>
      </div>
    </div>
  `);

  initSellOrder();

  const url = new URL(window.location);
  const from = url.searchParams.get('from') ?? null;
  const to = url.searchParams.get('to') ?? null;
  const searchingVal = url.searchParams.get('searching') ?? '';
  const sortNameVal = url.searchParams.get('sort-name') ?? '';
  const sortActionVal = url.searchParams.get('sort-action') ?? '';

  renderSellOrder({
    sortAction: sortActionVal,
    sortName: sortNameVal,
    searching: searchingVal,
    from,
    to,
  });

  $('.header-input').keypress(async (e) => {
    if (e.keyCode !== 13) return;

    const url = new URL(window.location);
    const value = e.target.value;
    const from = url.searchParams.get('from') ?? null;
    const to = url.searchParams.get('to') ?? null;
    const sortNameVal = url.searchParams.get('sort-name') ?? '';
    const sortActionVal = url.searchParams.get('sort-action') ?? '';

    if (!value) {
      url.searchParams.delete('searching');
      renderSellOrder({
        from,
        to,
        sortName: sortNameVal,
        sortAction: sortActionVal,
      });
    } else {
      $('.header-input').val('');
      url.searchParams.set('searching', value);

      renderSellOrder({
        from,
        to,
        sortName: sortNameVal,
        sortAction: sortActionVal,
        searching: value,
      });
    }
    history.pushState({}, '', url);
  });

  $('.btn-header').click(() => {
    const value = $('.header-input').val();
    const url = new URL(window.location);
    const from = url.searchParams.get('from') ?? null;
    const to = url.searchParams.get('to') ?? null;
    const sortNameVal = url.searchParams.get('sort-name') ?? '';
    const sortActionVal = url.searchParams.get('sort-action') ?? '';

    if (!value) {
      url.searchParams.delete('searching');
      renderSellOrder({
        from,
        to,
        sortNameVal,
        sortActionVal,
      });
    } else {
      $('.header-input').val('');
      url.searchParams.set('searching', value);

      renderSellOrder({
        from,
        to,
        sortName: sortNameVal,
        sortAction: sortActionVal,
        searching: value,
      });
    }
    history.pushState({}, '', url);
  });

  $('input[name="sell-order-daterange"]').daterangepicker(
    {
      opens: 'left',
    },
    async function (start, end, label) {
      let s = new Date(start.format());
      let e = new Date(end.format());

      s = s.getTime() / 1000;
      e = e.getTime() / 1000;

      const url = new URL(window.location);
      url.searchParams.set('from', s);
      url.searchParams.set('to', e);
      const sortNameVal = url.searchParams.get('sort-name') ?? '';
      const sortActionVal = url.searchParams.get('sort-action') ?? '';
      const searching = url.searchParams.get('searching') ?? '';
      history.pushState({}, '', url);

      renderSellOrder({
        from: s,
        to: e,
        sortName: sortNameVal,
        sortAction: sortActionVal,
        searching,
      });
    }
  );

  $('.icon-sort').click((e) => {
    const sort = e.target;

    const url = new URL(window.location);

    const sortVal = sort.dataset.sort;
    const name = sort.dataset.value;
    const searching = url.searchParams.get('searching') ?? '';
    const from = url.searchParams.get('from') ?? null;
    const to = url.searchParams.get('to') ?? null;

    if (sort.classList.contains('active')) {
      sort.classList.remove('before');
      sort.classList.remove('after');

      switch (sortVal) {
        case 'asc':
          sort.classList.add('before');
          sort.dataset.sort = 'desc';

          url.searchParams.set('sort-name', name);
          url.searchParams.set('sort-action', 'ASC');
          history.pushState({}, null, url);

          renderSellOrder({
            sortAction: 'ASC',
            sortName: name,
            from,
            to,
            searching,
          });

          break;
        case 'desc':
          sort.classList.add('after');
          sort.dataset.sort = 'asc';

          url.searchParams.set('sort-name', name);
          url.searchParams.set('sort-action', 'DESC');
          history.pushState({}, null, url);

          renderSellOrder({
            sortAction: 'DESC',
            sortName: name,
            from,
            to,
            searching,
          });
          break;
      }
      return;
    }

    $('.icon-sort.active').removeClass('before');
    $('.icon-sort.active').removeClass('after');
    $('.icon-sort.active').removeClass('active');

    sort.classList.add('active', 'before');

    url.searchParams.set('sort-name', name);
    url.searchParams.set('sort-action', 'ASC');
    history.pushState({}, null, url);

    renderSellOrder({
      sortAction: 'ASC',
      sortName: name,
      searching,
      from,
      to,
    });
  });
}
