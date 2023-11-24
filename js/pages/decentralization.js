import sign from 'jwt-encode';
import authGroupApi from '../api/authGroupApi';
import detailPermissionApi from '../api/detailPermissionApi';
import {
  getLocalStorage,
  isAccessAction,
  parseJwt,
  renderLoadingManager,
  setLocalStorage,
} from '../utils/constains';
import { toast } from '../utils/toast';
import { handleSearching, handleSorting } from './manager';

async function renderDecentralization(params = '') {
  try {
    const { data } = await authGroupApi.getAll(params);

    if (data.length <= 0) {
      $('.decentralization-content').html(`
        <tr>
          <td colspan="3">
            <h1 class="text-center my-5 w-100">Không có nhóm quyền nào cả!!!</h1>  
          </td>
        </tr>
      `);
      return;
    }

    const dataFilter = data.filter(
      (group) => group['trang_thai'] === true && group['mac_dinh'] === false
    );

    const dataHTML = dataFilter
      .map(
        (group) => `
          <tr align="center">
            <td>
              ${group['ma_nhom_quyen']}
            </td>
            <td>
              ${group['ten_nhom_quyen']}
            </td>
            <td>
              <div class="col-4 d-flex justify-content-center align-items-center">
                <i class="fa-solid fa-pen-to-square admin-action edit text-secondary" data-id="${group['ma_nhom_quyen']}"></i>
              </div>
            </td>
          </tr>
        `
      )
      .join('');

    $('.decentralization-content').html(dataHTML);

    $('.decentralization .admin-action.edit').click(async (e) => {
      if (!isAccessAction('decentralization', 'UPDATE')) return;
      const id = e.target.dataset.id;

      try {
        const data = await authGroupApi.getById(id);

        const permission = data['quyen_hang'];

        permission.forEach((per) => {
          switch (per['ten_quyen_hang']) {
            case 'products':
              $(`#toggle-${per['ten_chuc_nang'].toLowerCase()}-product`).attr(
                'data-per-id',
                per['ma_quyen_hang']
              );

              $(`#toggle-${per['ten_chuc_nang'].toLowerCase()}-product`).attr(
                'data-action-id',
                per['ma_chuc_nang']
              );

              $(`#toggle-${per['ten_chuc_nang'].toLowerCase()}-product`).prop(
                'checked',
                per['trang_thai_quyen_hang']
              );

              break;
            case 'auth-groups':
              $(`#toggle-${per['ten_chuc_nang'].toLowerCase()}-auth-group`).attr(
                'data-per-id',
                per['ma_quyen_hang']
              );

              $(`#toggle-${per['ten_chuc_nang'].toLowerCase()}-auth-group`).attr(
                'data-action-id',
                per['ma_chuc_nang']
              );

              $(`#toggle-${per['ten_chuc_nang'].toLowerCase()}-auth-group`).prop(
                'checked',
                per['trang_thai_quyen_hang']
              );
              break;
            case 'orders':
              $(`#toggle-${per['ten_chuc_nang'].toLowerCase()}-order`).attr(
                'data-per-id',
                per['ma_quyen_hang']
              );

              $(`#toggle-${per['ten_chuc_nang'].toLowerCase()}-order`).attr(
                'data-action-id',
                per['ma_chuc_nang']
              );

              $(`#toggle-${per['ten_chuc_nang'].toLowerCase()}-order`).prop(
                'checked',
                per['trang_thai_quyen_hang']
              );
              break;
            case 'decentralization':
              $(`#toggle-${per['ten_chuc_nang'].toLowerCase()}-decentralization`).attr(
                'data-per-id',
                per['ma_quyen_hang']
              );

              $(`#toggle-${per['ten_chuc_nang'].toLowerCase()}-decentralization`).attr(
                'data-action-id',
                per['ma_chuc_nang']
              );

              $(`#toggle-${per['ten_chuc_nang'].toLowerCase()}-decentralization`).prop(
                'checked',
                per['trang_thai_quyen_hang']
              );
              break;
            case 'accounts':
              $(`#toggle-${per['ten_chuc_nang'].toLowerCase()}-account`).attr(
                'data-per-id',
                per['ma_quyen_hang']
              );

              $(`#toggle-${per['ten_chuc_nang'].toLowerCase()}-account`).attr(
                'data-action-id',
                per['ma_chuc_nang']
              );

              $(`#toggle-${per['ten_chuc_nang'].toLowerCase()}-account`).prop(
                'checked',
                per['trang_thai_quyen_hang']
              );
              break;
            case 'statistics':
              $('#toggle-view-statistics').attr('data-per-id', per['ma_quyen_hang']);
              $('#toggle-view-statistics').attr('data-action-id', per['ma_chuc_nang']);
              $('#toggle-view-statistics').prop('checked', per['trang_thai_quyen_hang']);
              break;
            case 'brands':
              $(`#toggle-${per['ten_chuc_nang'].toLowerCase()}-brand`).attr(
                'data-per-id',
                per['ma_quyen_hang']
              );

              $(`#toggle-${per['ten_chuc_nang'].toLowerCase()}-brand`).attr(
                'data-action-id',
                per['ma_chuc_nang']
              );

              $(`#toggle-${per['ten_chuc_nang'].toLowerCase()}-brand`).prop(
                'checked',
                per['trang_thai_quyen_hang']
              );
              break;
            case 'customers':
              $(`#toggle-${per['ten_chuc_nang'].toLowerCase()}-customer`).attr(
                'data-per-id',
                per['ma_quyen_hang']
              );

              $(`#toggle-${per['ten_chuc_nang'].toLowerCase()}-customer`).attr(
                'data-action-id',
                per['ma_chuc_nang']
              );

              $(`#toggle-${per['ten_chuc_nang'].toLowerCase()}-customer`).prop(
                'checked',
                per['trang_thai_quyen_hang']
              );
              break;
            case 'employees':
              $(`#toggle-${per['ten_chuc_nang'].toLowerCase()}-employee`).attr(
                'data-per-id',
                per['ma_quyen_hang']
              );

              $(`#toggle-${per['ten_chuc_nang'].toLowerCase()}-employee`).attr(
                'data-action-id',
                per['ma_chuc_nang']
              );

              $(`#toggle-${per['ten_chuc_nang'].toLowerCase()}-employee`).prop(
                'checked',
                per['trang_thai_quyen_hang']
              );
              break;
            case 'import-orders':
              $(`#toggle-${per['ten_chuc_nang'].toLowerCase()}-import-order`).attr(
                'data-per-id',
                per['ma_quyen_hang']
              );

              $(`#toggle-${per['ten_chuc_nang'].toLowerCase()}-import-order`).attr(
                'data-action-id',
                per['ma_chuc_nang']
              );

              $(`#toggle-${per['ten_chuc_nang'].toLowerCase()}-import-order`).prop(
                'checked',
                per['trang_thai_quyen_hang']
              );
              break;
            case 'guarantee':
              $(`#toggle-${per['ten_chuc_nang'].toLowerCase()}-guarantee`).attr(
                'data-per-id',
                per['ma_quyen_hang']
              );

              $(`#toggle-${per['ten_chuc_nang'].toLowerCase()}-guarantee`).attr(
                'data-action-id',
                per['ma_chuc_nang']
              );

              $(`#toggle-${per['ten_chuc_nang'].toLowerCase()}-guarantee`).prop(
                'checked',
                per['trang_thai_quyen_hang']
              );
              break;
          }
        });

        $('#toggle-all-statistics').prop('checked', false);
        $('#toggle-all-product').prop('checked', false);
        $('#toggle-all-auth-group').prop('checked', false);
        $('#toggle-all-order').prop('checked', false);
        $('#toggle-all-decentralization').prop('checked', false);
        $('#toggle-all-customer').prop('checked', false);
        $('#toggle-all-employee').prop('checked', false);
        $('#toggle-all-import-order').prop('checked', false);
        $('#toggle-all-guarantee').prop('checked', false);
        $('#toggle-all-account').prop('checked', false);
        $('#toggle-all-brand').prop('checked', false);

        $('#viewAndUpdateDecentralizationModal').attr('data-id', e.target.dataset.id);
        $('#viewAndUpdateDecentralizationModal').modal('show');
      } catch (error) {
        console.log(error.message);
      }
    });
  } catch (error) {
    console.log(error.message);
  }
}

export function renderDecentralizationPage() {
  const loadingHTML = renderLoadingManager(18, 3);

  $('.admin-content').html(`
    <div class="decentralization">
      <div class="decentralization-header">
        <h1>Phân quyền</h1>
      </div>
      <div class="search-container">
        <div class="search-box">
          <input type="text" class="header-input" placeholder="Tìm kiếm theo mã, tên nhóm quyền" />
          <button type="button" class="btn primary btn-header">
            <i class="fa-solid fa-magnifying-glass"></i>
          </button>
        </div>
      </div>
      <div class="decentralization-table-container">
        <table class="decentralization-table">
          <thead>
            <tr align="center">
              <th>
                <div class="d-flex align-items-center justify-content-center gap-3 ">
                  Mã nhóm quyền
                  <div class="icon-sort active before" data-value="ma_nhom_quyen" data-sort="desc"></div>
                </div>
              </th>
              <th>
                <div class="d-flex align-items-center justify-content-center gap-3 ">
                  Tên nhóm quyền
                  <div class="icon-sort" data-value="ten_nhom_quyen" data-sort="desc"></div>
                </div>
              </th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody class="decentralization-content">
            ${loadingHTML}
          </tbody>
        </table>
      </div>
    </div>
  `);

  const url = new URL(window.location);
  const searchingVal = url.searchParams.get('searching') ?? '';
  const sortNameVal = url.searchParams.get('sort-name') ?? '';
  const sortActionVal = url.searchParams.get('sort-action') ?? '';

  renderDecentralization({
    sortAction: sortActionVal,
    sortName: sortNameVal,
    searching: searchingVal,
  });

  $('.header-input').keypress(async (e) => {
    if (e.keyCode !== 13) return;

    handleSearching(e.target.value, renderDecentralization);
  });

  $('.btn-header').click(() => {
    handleSearching($('.header-input').val(), renderDecentralization);
  });

  $('.icon-sort').click((e) => {
    handleSorting(e, renderDecentralization);
  });
}

$('#viewAndUpdateDecentralizationModal input[type="checkbox"]').change(async (e) => {
  const ma_nhom_quyen = $('#viewAndUpdateDecentralizationModal').attr('data-id');

  if (e.target.id.includes('all')) {
    const parent = e.target.parentElement.parentElement.parentElement;
    const perList = Array.from(
      parent.querySelectorAll('#viewAndUpdateDecentralizationModal input[type="checkbox"]')
    );
    perList.shift();

    if (e.target.checked) {
      perList.forEach(async (per) => {
        const ma_quyen_hang = per.dataset.perId;
        const ma_chuc_nang = per.dataset.actionId;
        const trang_thai = true;
        per.checked = true;

        await detailPermissionApi.update({
          ma_nhom_quyen,
          ma_quyen_hang,
          ma_chuc_nang,
          trang_thai,
        });

        const accessToken = getLocalStorage('access_token');
        const oldData = parseJwt(accessToken);

        const user = oldData.data;

        const permission = user.permission.map((per) => {
          if (per['ma_quyen_hang'] === ma_quyen_hang && per['ma_chuc_nang'] === ma_chuc_nang) {
            per['trang_thai_quyen_hang'] = trang_thai;
          }

          return per;
        });

        user.permission = permission;

        const secret = 'laptop ecommerce';

        const data = {
          ...oldData,
          data: user,
        };

        const jwt = sign(data, secret);

        setLocalStorage('access_token', jwt);
        setLocalStorage('user', user);
      });
    } else {
      perList.forEach(async (per) => {
        const ma_quyen_hang = per.dataset.perId;
        const ma_chuc_nang = per.dataset.actionId;
        const trang_thai = false;
        per.checked = false;

        await detailPermissionApi.update({
          ma_nhom_quyen,
          ma_quyen_hang,
          ma_chuc_nang,
          trang_thai,
        });

        const accessToken = getLocalStorage('access_token');
        const oldData = parseJwt(accessToken);

        const user = oldData.data;

        const permission = user.permission.map((per) => {
          if (per['ma_quyen_hang'] === ma_quyen_hang && per['ma_chuc_nang'] === ma_chuc_nang) {
            per['trang_thai_quyen_hang'] = trang_thai;
          }

          return per;
        });

        user.permission = permission;

        const secret = 'laptop ecommerce';

        const data = {
          ...oldData,
          data: user,
        };

        const jwt = sign(data, secret);

        setLocalStorage('access_token', jwt);
        setLocalStorage('user', user);
      });
    }

    return;
  }

  try {
    const ma_quyen_hang = e.target.dataset.perId;
    const ma_chuc_nang = e.target.dataset.actionId;
    const trang_thai = e.target.checked;

    await detailPermissionApi.update({
      ma_nhom_quyen,
      ma_quyen_hang,
      ma_chuc_nang,
      trang_thai,
    });

    const accessToken = getLocalStorage('access_token');
    const oldData = parseJwt(accessToken);

    const user = oldData.data;

    const permission = user.permission.map((per) => {
      if (per['ma_quyen_hang'] === ma_quyen_hang && per['ma_chuc_nang'] === ma_chuc_nang) {
        per['trang_thai_quyen_hang'] = trang_thai;
      }

      return per;
    });

    user.permission = permission;

    const secret = 'laptop ecommerce';

    const data = {
      ...oldData,
      data: user,
    };

    const jwt = sign(data, secret);

    setLocalStorage('access_token', jwt);
    setLocalStorage('user', user);
  } catch (error) {
    toast({
      title: 'Oops!! Có lỗi gì đó rồi mời bạn quay lại sau',
      type: 'error',
      duration: 2000,
    });
  }
});
