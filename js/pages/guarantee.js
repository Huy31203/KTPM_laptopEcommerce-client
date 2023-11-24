import moment from 'moment';
import { toast } from '../utils/toast';
import { isAccessAction, renderLoadingManager } from '../utils/constains';
import guaranteeApi from '../api/guaranteeApi';

function initGuarantee() {
  const now = new Date();
  const date = new Date();

  date.setMonth(date.getMonth() - 1);

  $('input[name="guarantee-daterange"]').val(
    `${moment(date).format('L')} - ${moment(now).format('L')}`
  );

  const from = Math.floor(date.getTime() / 1000);
  const to = Math.floor(now.getTime() / 1000);

  const url = new URL(window.location);
  url.searchParams.set('from', from);
  url.searchParams.set('to', to);
  history.pushState({}, '', url);
}

export async function renderGuarantee(params = '') {
  try {
    const guaranteeList = await guaranteeApi.getAll(params);

    if (guaranteeList.length <= 0) {
      $('.guarantee-content').html(`
        <tr>
          <td colspan="4">
            <h1 class="text-center my-5 w-100">Không có bảo hành nào cả!!!</h1>  
          </td>
        </tr>
      `);
      return;
    }

    const guaranteeHTML = guaranteeList.map((guarantee) => {
      return `
        <tr align="center">
          <td>
            ${guarantee['ma_bao_hanh']}
          </td>
          <td>
            ${guarantee['ma_chi_tiet_san_pham']}
          </td>
          <td>
            ${guarantee['ma_khach_hang']}
          </td>
          <td>
            <div class="d-flex justify-content-center align-items-center gap-2">
              <i class="fa-solid fa-circle-info admin-action viewmore text-primary" data-id="${guarantee['ma_bao_hanh']}"></i>
              <i class="fa-solid fa-trash admin-action remove text-danger" data-id="${guarantee['ma_bao_hanh']}"></i>
            </div>
          </td>
        </tr>
      `;
    });

    $('.guarantee-content').html(guaranteeHTML);

    $('.guarantee .admin-action.viewmore').click(async (e) => {
      $('#viewmoreGuaranteeModal').modal('show');
      $('#viewmoreGuaranteeModal').attr('data-id', e.target.dataset.id);
      await handleUpdateGuarantee(e.target.dataset.id);
    });

    $('.guarantee .admin-action.remove').click(async (e) => {
      if (!isAccessAction('guarantee', 'DELETE')) return;
      $('#deleteGuaranteeModal').modal('show');
      $('#deleteGuaranteeModal').attr('data-id', e.target.dataset.id);
    });
  } catch (error) {
    console.log(error.message);
  }
}

async function handleUpdateGuarantee(id) {
  try {
    $('#viewmoreGuaranteeModal').attr('data-id', id);
    $('#viewmoreGuaranteeModal').modal('show');

    const guarantee = await guaranteeApi.getById(id);

    $('#viewmoreGuaranteeModal .create-time span').html(moment(guarantee['ngay_lap']).format('L'));
    $('#viewmoreGuaranteeModal .expire-time span').html(
      moment(guarantee['ngay_het_han']).format('L')
    );

    $('#viewmoreGuaranteeModal #guarantee-id').val(guarantee['ma_bao_hanh']);
    $('#viewmoreGuaranteeModal #detail-product-id').val(guarantee['ma_chi_tiet_san_pham']);
    $('#viewmoreGuaranteeModal #customer-id').val(guarantee['ma_khach_hang']);
  } catch (error) {
    console.log(error.message);
  }
}

export function renderGuaranteePage() {
  const loadingHTML = renderLoadingManager(18, 4);

  $('.admin-content').html(`
    <div class="guarantee">
      <div class="guarantee-header">
        <h1>Bảo hành</h1>
        <input type="text" name="guarantee-daterange" value="" />
      </div>
      <div class="search-container">
        <div class="search-box">
          <input type="text" class="header-input" placeholder="Tìm kiếm theo mã bảo hành, mã khách hàng, mã chi tiết sản phẩm" />
          <button type="button" class="btn primary btn-header">
            <i class="fa-solid fa-magnifying-glass"></i>
          </button>
        </div>
      </div>
      <div class="guarantee-table-container">
        <table class="guarantee-table">
          <thead>
            <tr align="center">
              <th>
                <div class="d-flex align-items-center justify-content-center gap-3 ">
                  Mã bảo hành
                  <div class="icon-sort active before" data-value="ma_bao_hanh" data-sort="desc"></div>
                </div>
              </th>
              <th>
                <div class="d-flex align-items-center justify-content-center gap-3 ">
                  Mã chi tiết sản phẩm
                  <div class="icon-sort" data-value="ma_chi_tiet_san_pham" data-sort="desc"></div>
                </div>
              </th>
              <th>
                <div class="d-flex align-items-center justify-content-center gap-3 ">
                  Mã khách hàng
                  <div class="icon-sort" data-value="ma_khach_hang" data-sort="desc"></div>
                </div>
              </th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody class="guarantee-content">
            ${loadingHTML}
          </tbody>
        </table>
      </div>
    </div>
  `);

  initGuarantee();

  const url = new URL(window.location);
  const from = url.searchParams.get('from') ?? null;
  const to = url.searchParams.get('to') ?? null;
  const searchingVal = url.searchParams.get('searching') ?? '';
  const sortNameVal = url.searchParams.get('sort-name') ?? '';
  const sortActionVal = url.searchParams.get('sort-action') ?? '';

  renderGuarantee({
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
      renderGuarantee({
        sortAction: sortActionVal,
        sortName: sortNameVal,
        from,
        to,
      });
    } else {
      $('.header-input').val('');
      url.searchParams.set('searching', value);

      renderGuarantee({
        sortAction: sortActionVal,
        sortName: sortNameVal,
        searching: value,
        from,
        to,
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
      renderGuarantee({
        sortAction: sortActionVal,
        sortName: sortNameVal,
        from,
        to,
      });
    } else {
      $('.header-input').val('');
      url.searchParams.set('searching', value);
      renderGuarantee({
        sortAction: sortActionVal,
        sortName: sortNameVal,
        searching: value,
        from,
        to,
      });
    }

    history.pushState({}, '', url);
  });

  $('input[name="guarantee-daterange"]').daterangepicker(
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
      const searchingVal = url.searchParams.get('searching') ?? '';
      const sortNameVal = url.searchParams.get('sort-name') ?? '';
      const sortActionVal = url.searchParams.get('sort-action') ?? '';
      history.pushState({}, '', url);

      renderGuarantee({
        sortAction: sortActionVal,
        sortName: sortNameVal,
        searching: searchingVal,
        from: s,
        to: e,
      });
    }
  );

  $('.icon-sort').click((e) => {
    const sort = e.target;

    const url = new URL(window.location);

    const from = url.searchParams.get('from') ?? null;
    const to = url.searchParams.get('to') ?? null;
    const sortVal = sort.dataset.sort;
    const name = sort.dataset.value;
    const searching = url.searchParams.has('searching') ? url.searchParams.get('searching') : '';

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

          renderGuarantee({
            sortAction: 'ASC',
            sortName: name,
            searching,
            from,
            to,
          });

          break;
        case 'desc':
          sort.classList.add('after');
          sort.dataset.sort = 'asc';

          url.searchParams.set('sort-name', name);
          url.searchParams.set('sort-action', 'DESC');
          history.pushState({}, null, url);

          renderGuarantee({
            sortAction: 'DESC',
            sortName: name,
            searching,
            from,
            to,
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

    renderGuarantee({
      sortAction: 'ASC',
      sortName: name,
      searching,
      from,
      to,
    });
  });
}

$('#deleteGuaranteeModal .btn-yes').click(async () => {
  if (!isAccessAction('guarantee', 'DELETE')) return;

  try {
    const id = $('#deleteGuaranteeModal').attr('data-id');

    await guaranteeApi.remove(id);

    toast({
      title: 'Xóa thành công',
      duration: 3000,
      type: 'success',
    });

    const url = new URL(window.location);

    const from = url.searchParams.get('from') ?? null;
    const to = url.searchParams.get('to') ?? null;
    const searchingVal = url.searchParams.get('searching') ?? '';
    const sortNameVal = url.searchParams.get('sort-name') ?? '';
    const sortActionVal = url.searchParams.get('sort-action') ?? '';

    renderGuarantee({
      sortAction: sortActionVal,
      sortName: sortNameVal,
      searching: searchingVal,
      from,
      to,
    });
  } catch (error) {
    toast({
      title: 'Xóa không thành công',
      duration: 3000,
      type: 'error',
    });
  } finally {
    $('#deleteGuaranteeModal').modal('hide');
  }
});
