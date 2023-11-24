import authGroupApi from '../api/authGroupApi';
import { handleSearching, handleSorting } from './manager';
import { isAccessAction, renderLoadingManager } from '../utils/constains';
import { toast } from '../utils/toast';
import { validation } from '../utils/validation';

async function renderAuthGroup(params = '') {
  try {
    const { data } = await authGroupApi.getAll(params);

    if (data.length <= 0) {
      $('.auth-group-content').html(`
        <tr>
          <td colspan="4">
            <h1 class="text-center my-5 w-100">Không có nhóm quyền nào cả!!!</h1>  
          </td>
        </tr>
      `);
      return;
    }

    const dataFilter = data.filter((group) => group['mac_dinh'] === false);

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
              <div class="toggle">
                <input
                  type="checkbox"
                  id="toggle-${group['ma_nhom_quyen']}"
                  name="outstanding-auth"
                  hidden
                  ${group['trang_thai'] ? 'checked' : ''}
                  data-id="${group['ma_nhom_quyen']}"
                />
                <label for="toggle-${group['ma_nhom_quyen']}">
                  <div class="toggle"></div>
                </label>
              </div>
            </td>
            <td>
              <div class="d-flex justify-content-center align-items-center">
                <i class="fa-solid fa-pen-to-square admin-action edit text-secondary" data-id="${
                  group['ma_nhom_quyen']
                }"></i>
              </div>
            </td>
          </tr>
        `
      )
      .join('');

    $('.auth-group-content').html(dataHTML);

    $('.auth-group .admin-action.edit').click(async (e) => {
      if (!isAccessAction('auth-groups', 'UPDATE')) return;
      const id = e.target.dataset.id;

      try {
        const data = await authGroupApi.getById(id);

        $('#viewAndUpdateAuthGroupModal #auth_group_name-update').val(data['ten_nhom_quyen']);
        $('#viewAndUpdateAuthGroupModal #auth_group_desc-update').val(data['mo_ta']);

        $('#viewAndUpdateAuthGroupModal').attr('data-id', e.target.dataset.id);
        $('#viewAndUpdateAuthGroupModal').modal('show');
      } catch (error) {
        console.log(error.message);
      }
    });

    $('.auth-group input[name="outstanding-auth"]').click(async (e) => {
      if (!isAccessAction('auth-groups', 'UPDATE')) return;
      const id = e.target.dataset.id;

      try {
        await authGroupApi.update({
          ma_nhom_quyen: id,
          trang_thai: e.target.checked,
        });
      } catch (error) {
        console.log(error.message);
      }
    });
  } catch (error) {
    console.log(error.message);
  }
}

export function renderAuthGroupPage() {
  const loadingHTML = renderLoadingManager(18, 4);

  $('.admin-content').html(`
    <div class="auth-group">
      <div class="auth-group-header">
        <h1>Nhóm quyền</h1>
        <div>
          <i class="fa-solid fa-circle-plus"></i> thêm nhóm quyền
        </div>
      </div>
      <div class="search-container">
        <div class="search-box">
          <input type="text" class="header-input" placeholder="Tìm kiếm theo mã, tên nhóm quyền" />
          <button type="button" class="btn primary btn-header">
            <i class="fa-solid fa-magnifying-glass"></i>
          </button>
        </div>
      </div>
      <div class="auth-group-table-container">
        <table class="auth-group-table">
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
              <th>Trạng thái</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody class="auth-group-content">
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

  renderAuthGroup({
    sortAction: sortActionVal,
    sortName: sortNameVal,
    searching: searchingVal,
  });

  $('.header-input').keypress(async (e) => {
    if (e.keyCode !== 13) return;
    handleSearching(e.target.value, renderAuthGroup);
  });

  $('.btn-header').click(() => {
    handleSearching($('.header-input').val(), renderAuthGroup);
  });

  $('.auth-group .auth-group-header div').click(() => {
    if (!isAccessAction('auth-groups', 'CREATE')) return;
    $('#createAuthGroupModal').modal('show');
  });

  $('.icon-sort').click((e) => {
    handleSorting(e, renderAuthGroup);
  });
}

$('#viewAndUpdateAuthGroupModal .btn-update').click(async () => {
  if (!isAccessAction('auth-groups', 'UPDATE')) return;

  try {
    const ma_nhom_quyen = $('#viewAndUpdateAuthGroupModal').attr('data-id');
    const ten_nhom_quyen = $('#viewAndUpdateAuthGroupModal #auth_group_name-update').val();
    const mo_ta = $('#viewAndUpdateAuthGroupModal #auth_group_desc-update').val();

    const data = {
      ma_nhom_quyen,
      ten_nhom_quyen,
      mo_ta,
    };

    await authGroupApi.update(data);

    toast({
      title: 'Thay đổi nhóm quyền thành công',
      type: 'success',
    });

    const url = new URL(window.location);
    const searchingVal = url.searchParams.get('searching') ?? '';
    const sortNameVal = url.searchParams.get('sort-name') ?? '';
    const sortActionVal = url.searchParams.get('sort-action') ?? '';

    renderAuthGroup({
      sortAction: sortActionVal,
      sortName: sortNameVal,
      searching: searchingVal,
    });
  } catch (error) {
    toast({
      title: 'Thay đổi nhóm quyền không thành công',
      type: 'error',
    });
  } finally {
    $('#viewAndUpdateAuthGroupModal').modal('hide');
  }
});

$('#createAuthGroupModal .btn-add').click(async () => {
  if (!isAccessAction('auth-groups', 'CREATE')) return;

  if (validation($('#createAuthGroupModal #auth_group_name-create')[0])) return;

  try {
    const ten_nhom_quyen = $('#createAuthGroupModal #auth_group_name-create').val();
    const mo_ta = $('#createAuthGroupModal #auth_group_desc-create').val();
    const trang_thai = false;

    const data = {
      ten_nhom_quyen,
      mo_ta,
      trang_thai,
    };

    await authGroupApi.add(data);

    toast({
      title: 'Tạo nhóm quyền mới thành công',
      type: 'success',
    });

    const url = new URL(window.location);
    const searchingVal = url.searchParams.get('searching') ?? '';
    const sortNameVal = url.searchParams.get('sort-name') ?? '';
    const sortActionVal = url.searchParams.get('sort-action') ?? '';

    renderAuthGroup({
      sortAction: sortActionVal,
      sortName: sortNameVal,
      searching: searchingVal,
    });
  } catch (error) {
    toast({
      title: 'Tạo nhóm quyền mới không thành công',
      type: 'error',
    });
  } finally {
    $('#createAuthGroupModal').modal('hide');
  }
});
