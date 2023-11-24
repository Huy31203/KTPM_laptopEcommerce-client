import orderApi from '../api/orderApi';
import { handleChartBrand, handleChartReport } from '../pages/overview';

export function renderChartReport(data, year = new Date().getFullYear()) {
  const series = handleChartReport(data, year);

  const optionsArea = {
    series,
    chart: {
      height: 350,
      type: 'area',
      toolbar: {
        show: true,
        tools: {
          zoom: false,
          selection: false,
          zoom: false,
          zoomin: false,
          zoomout: false,
          pan: false,
          reset: false,
        },
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      curve: 'smooth',
    },
    xaxis: {
      type: 'string',
      categories: [
        'Jan',
        'Feb',
        'Mar',
        'Apr',
        'May',
        'Jun',
        'Jul',
        'Aug',
        'Sep',
        'Oct',
        'Nov',
        'Dec',
      ],
    },
  };

  const chartArea_1 = new ApexCharts(document.querySelector('#chart-area-1'), optionsArea);
  chartArea_1.render();

  $('input[name="chart-daterange"]').change(async (e) => {
    const now = new Date();

    const value = e.target.value;

    if (!value || value < 1000 || value > 9999) {
      e.target.value = now.getFullYear();
      return;
    }

    try {
      const orderList = await orderApi.getAll();

      const series = handleChartReport(orderList, Number(value));
      chartArea_1.updateSeries(series);
    } catch (error) {
      console.log(error.message);
    }
  });

  return chartArea_1;
}

export async function renderChartBrand(data, from, to) {
  const { series, brand } = await handleChartBrand(data, from, to);

  const optionsDonut = {
    series,
    chart: {
      width: '100%',
      type: 'pie',
    },
    labels: brand,
    theme: {
      monochrome: {
        enabled: true,
      },
    },
    plotOptions: {
      pie: {
        dataLabels: {
          offset: -5,
        },
      },
    },
    dataLabels: {
      formatter(val, opts) {
        const name = opts.w.globals.labels[opts.seriesIndex];
        return [name, val.toFixed(1) + '%'];
      },
    },
    legend: {
      show: false,
    },
  };

  const chartArea_2 = new ApexCharts(document.querySelector('#chart-area-2'), optionsDonut);
  chartArea_2.render();

  const date = new Date();
  const now = new Date();
  date.setMonth(date.getMonth() - 1);

  $('input[name="brand-daterange"]').daterangepicker(
    {
      startDate: moment(date).format('L'),
      endDate: moment(now).format('L'),
      opens: 'left',
    },
    async function (start, end, label) {
      const startDate = new Date(start.format('YYYY-MM-DD'));
      const endDate = new Date(end.format('YYYY-MM-DD'));

      const from = startDate.getTime();
      const to = endDate.getTime();

      try {
        const orderList = await orderApi.getAll();

        const { series } = await handleChartBrand(orderList, from, to);

        chartArea_2.updateSeries(series);
      } catch (error) {
        console.log(error.message);
      }
    }
  );

  return chartArea_2;
}
