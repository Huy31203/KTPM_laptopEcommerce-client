import orderApi from '../api/orderApi';
import {
  convertCurrency,
  getLocalStorage,
  initCartList,
  initHeader,
  parseJwt,
  urlServer,
} from '../utils/constains';
import { toast } from '../utils/toast';

initCartList();
initHeader();

function setDateFilter() {
  const currentDate = moment().set({ hour: 23, minute: 59, second: 59 }).utc(); // current date in UTC with milliseconds format
  const oneMonthBefore = moment()
    .set({ hour: 7, minute: 0, second: 0 })
    .subtract(1, 'months')
    .utc(); // 1 month before in UTC with milliseconds format
  $('.history__header-date').val(
    `${oneMonthBefore.format('DD/MM/YYYY')} - ${currentDate.format('DD/MM/YYYY')}`
  );
  const url = new URL(window.location);

  if (url.searchParams.get('from') === null && url.searchParams.get('from') === null) {
    url.searchParams.set('from', parseInt(oneMonthBefore.valueOf() / 1000));
    url.searchParams.set('to', parseInt(currentDate.valueOf() / 1000));
    window.history.pushState({}, '', url);
  }
}

async function updateOrder(data) {
  try {
    await orderApi.update(data);
  } catch (error) {
    console.error(error);
  }
}

$(function () {
  $('input[name="dates"]').daterangepicker(
    {
      opens: 'left',
      locale: {
        format: 'DD/MM/YYYY',
        language: 'vn',
      },
    },
    function (start, end, label) {
      let s = new Date(start.format());
      let e = new Date(end.format());

      const url = new URL(window.location);
      url.searchParams.set('from', parseInt(s.getTime() / 1000));
      url.searchParams.set('to', parseInt(e.getTime() / 1000));
      window.history.pushState({}, '', url);

      renderHistory();
    }
  );
});

$('input[name="dates"]').on('cancel.daterangepicker', function (ev, picker) {
  let url = new URL(window.location.href);

  let params = url.searchParams;

  params.delete('from');

  params.delete('to');

  url.search = params.toString();

  window.history.pushState({}, '', url.href);

  renderHistory();
});

$('.btn-method').on('click', (e) => {
  $('#detail').modal('hide');
  if ($('.btn-method').data('preMethod') !== $('.btn-method').data('method')) {
    $('.btn-change-method').data('ma_don_hang', e.currentTarget.id);
    $('.btn-change-method').data('method', $('.btn-method').data('method'));
    $('#change-method').modal('show');
  }
});

$('.btn-method-cancel').on('click', () => {
  $('#detail').modal('show');
});

$('.btn-cancel').on('click', (e) => {
  $('#detail').modal('hide');
  $('.btn-cancel-order').data('ma_don_hang', e.currentTarget.id);
  $('#cancel-order').modal('show');
});

$('.btn-change-method').on('click', ChangeMethodHandler);
$('.btn-cancel-order').on('click', CancelOrderHandler);

async function ChangeMethodHandler() {
  let orderID = parseInt($(this).data('ma_don_hang'));
  let method = $(this).data('method');

  let order = {
    ma_don_hang: orderID,
    hinh_thuc_thanh_toan: method,
  };

  await updateOrder(order);

  $('#change-method').modal('hide');

  renderHistory();

  toast({
    title: 'Thành công',
    message: `Đã đổi phương thức thanh toán của đơn hàng ${orderID} thành "${
      method === 'prepaid' ? 'Trả trước' : 'Trả sau'
    }"`,
    type: 'success',
    duration: 4000,
  });
}

async function CancelOrderHandler() {
  let orderID = parseInt($(this).data('ma_don_hang'));

  let data = await orderApi.getById(orderID);

  let orderedProducts = [];

  data.danh_sach_san_pham_da_mua.forEach((item) => {
    let product = {
      ma_san_pham: item.ma_san_pham,
      so_luong_da_mua: item.so_luong_da_mua,
    };

    orderedProducts.push(product);
  });

  let order = {
    ma_don_hang: orderID,
    trang_thai: 'đã hủy',
    danh_sach_san_pham_da_mua: orderedProducts,
  };

  await orderApi.update(order);

  $('#cancel-order').modal('hide');

  renderHistory();

  toast({
    title: 'Thành công',
    message: `Đã huỷ thành công đơn hàng ${orderID}`,
    type: 'success',
    duration: 4000,
  });
}

$('.history__menu-item').on('click', (e) => {
  const url = new URL(window.location);
  url.searchParams.set('order_type', e.currentTarget.id);
  window.history.pushState({}, '', url);

  renderHistory();
});

function convertSatus(status) {
  if (status === 'chờ xử lý') {
    return 'waiting';
  } else if (status === 'đang giao hàng') {
    return 'shipping';
  } else if (status === 'hoàn thành') {
    return 'completed';
  }

  return 'canceled';
}

async function renderHistory() {
  let htmlString = ``;
  const url = new URL(window.location);
  let order_type = url.searchParams.get('order_type') || 'all';
  let start = parseInt(url.searchParams.get('from'));
  let end = parseInt(url.searchParams.get('to'));
  const { userId } = getLocalStorage('user');
  let query = {};
  let totalMoney = 0;

  if (!isNaN(start) && !isNaN(end) && start <= end) {
    query = {
      order_type: order_type,
      from: start,
      to: end,
      userId,
    };
  } else {
    query = { order_type: order_type, userId };
  }

  let data = await orderApi.getAll(query);

  $('.history__menu-item.active').removeClass('active');
  $(`.history__menu-item#${order_type}`).addClass('active');

  if (data.length == 0) {
    $('.history__table-body').html(``);
    $('.history__table-body').html(
      `<tr>
      <td class="history__table-body-item empty" colspan="6">Không có đơn hàng</td>
      </tr>`
    );
  } else {
    $('.history__table-body').html(``);
    data.forEach((item, idx) => {
      totalMoney = item.tong_tien;
      htmlString += `
          <tr>
          <td class="history__table-body-item">${item.ma_don_hang}</td>
          <td class="history__table-body-item">
            <span class="paid-item ${item.hinh_thuc_thanh_toan}">${
        item.hinh_thuc_thanh_toan === 'postpaid' ? 'Trả sau' : 'Trả trước'
      }</span>
          </td>
          <td class="history__table-body-item">${moment(item.thoi_gian_dat_mua)
            .utc()
            .format('DD/MM/YYYY')
            .replace(/ /g, '/')}</td>
          <td class="history__table-body-item">
            <span class="price-item">${convertCurrency(totalMoney)}</span>
          </td>
          <td class="history__table-body-item">
            <span class="status-item ${convertSatus(item.trang_thai)}">${item.trang_thai}</span>
          </td>
          <td class="history__table-body-item">
            <span class="info-item" id="${item.ma_don_hang}">
              <i class="fa-solid fa-circle-info"></i>
            </span>
          </td>
          </tr>`;

      $('.history__table-body').html(htmlString);
    });
  }

  $('.info-item').on('click', (e) => {
    let id = e.currentTarget.id;
    detailHandler(data, id, totalMoney);
  });
}

function detailHandler(data, id, totalMoney) {
  $('#detail').modal('show');

  let filteredData = data.filter((item) => {
    return item.ma_don_hang == id;
  });

  let method = filteredData[0].hinh_thuc_thanh_toan;
  let status = filteredData[0].trang_thai;
  let purchaseDate = moment(filteredData[0].thoi_gian_dat_mua).utc().format('DD/MM/YYYY');
  let purchasedProduct = filteredData[0].danh_sach_san_pham_da_mua;

  $('#Paid').val(method);

  if (true) {
    $('#Paid').attr('disabled', false);
    $('.btn-cancel').attr('id', id);
    $('.btn-cancel').attr('disabled', false);

    $('#Paid').on('change', () => {
      $('.btn-method').attr('id', id);
      $('.btn-method').data('preMethod', method);
      $('.btn-method').data('method', $('#Paid').val());
      $('.btn-method').attr('disabled', false);
    });
  } else {
    $('#Paid').attr('disabled', true);
    $('.btn-method').attr('disabled', true);
    $('.btn-cancel').attr('disabled', true);
  }
  $('.detail-info_date').text(purchaseDate.replace(/ /g, '/'));
  $(`.detail-info_status`).text('');
  $(`.detail-info_status.${convertSatus(status)}`).text(status);

  renderHistoryProducts(purchasedProduct, totalMoney);
}

function renderHistoryProducts(data, totalMoney) {
  let htmlString = '';

  data.forEach((item) => {
    htmlString += `
    <li class="detail-info_paid-item">
      <div class="paid-item_container container">
        <div class="paid-item_row row">
          <div class="col-4">
            <div class="paid-item_img-container">
              <img class="paid-item_img" src="${urlServer}/images/${
      item.hinh_anh
    }" alt="" width="70px" height="70px">
            </div>
          </div>
          <div class="col-8">
            <div class="paid-item_info">
              <div class="paid-item_name">${item.ten_san_pham}</div>
              <span class="paid-item_price">${convertCurrency(
                (item.don_gia * (100 - item.giam_gia_san_pham)) / 100
              )}</span>
              <span class="paid-item_amount"> x${item.so_luong_da_mua}</span><br>
              ${
                item.giam_gia_san_pham && item.giam_gia_san_pham > 0
                  ? `
                    <span class="paid-item_cost">${convertCurrency(item.don_gia)}</span>
                    <span class="paid-item_discount">-${item.giam_gia_san_pham}%</span>
                  `
                  : ''
              }
            </div>
          </div>
        </div>
      </div>
    </li>`;
  });

  $('.detail-info_paid-list').html(htmlString);
  $('.detail-info_total-money').text(convertCurrency(totalMoney));
}

async function initHistory() {
  const accessToken = getLocalStorage('access_token');

  if (!accessToken) {
    window.location.href = '/';
    return;
  }

  const token = parseJwt(accessToken);

  const now = parseInt(Date.now() / 1000);

  if (now > token.exp) {
    window.location.href = '/login.html';
    return;
  }

  setDateFilter();
  renderHistory();
}

initHistory();
