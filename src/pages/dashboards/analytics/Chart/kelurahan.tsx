// ** MUI Imports
import Card from '@mui/material/Card'
import { useTheme } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import CardContent from '@mui/material/CardContent'

// ** Third Party Imports
import { ApexOptions } from 'apexcharts'

// ** Custom Components Import
import ReactApexcharts from 'src/@core/components/react-apexcharts'

// ** Util Import
import { hexToRGBA } from 'src/@core/utils/hex-to-rgba'
import axios from 'axios'
import { useState, useEffect } from 'react'

const JumlahKelurahan = () => {

  const [apiData, setApiData] = useState([]);
  const [percentaseKelurahan, setPercentaseKelurahan] = useState(0);
  const [dataLoaded, setDataLoaded] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('http://newdashboard.bil/api/perangkat-daerah', {
          headers: {
            'key': '1234567890'
          }
        });

        const result = response.data;
        setApiData(result.data);
        setDataLoaded(true);

        // Tampilkan jumlah data kecamatan di console
        const kelurahanData = result.data.filter(item => item.jenis === 'kelurahan');

        // Hitung persentase kecamatan dari total yang diinginkan
        const totalKelurahan = 14; // Ganti dengan jumlah total kecamatan yang diinginkan
        const percentaseKelurahan = ((kelurahanData.length / totalKelurahan) * 100).toFixed(2);
        setPercentaseKelurahan(parseFloat(percentaseKelurahan));
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);


  // ** Hook
  const theme = useTheme()

  const options: ApexOptions = {
    chart: {
      sparkline: { enabled: true }
    },
    stroke: { lineCap: 'round' },
    colors: [hexToRGBA(theme.palette.warning.main, 1)],
    states: {
      hover: {
        filter: { type: 'none' }
      },
      active: {
        filter: { type: 'none' }
      }
    },
    plotOptions: {
      radialBar: {
        endAngle: 90,
        startAngle: -90,
        hollow: { size: '64%' },
        track: {
          strokeWidth: '40%',
          background: hexToRGBA(theme.palette.customColors.trackBg, 1)
        },
        dataLabels: {
          name: { show: false },
          value: {
            offsetY: -3,
            fontWeight: 600,
            color: theme.palette.text.primary,
            fontFamily: theme.typography.fontFamily,
            fontSize: theme.typography.h4.fontSize as string
          }
        }
      }
    },
    grid: {
      padding: {
        bottom: 15
      }
    },
    responsive: [
      {
        breakpoint: theme.breakpoints.values.lg,
        options: {
          chart: { height: 199 }
        }
      },
      {
        breakpoint: 430,
        options: {
          chart: { height: 150 }
        }
      }
    ]
  }

  return (
    <Card>
      <CardContent>
      {dataLoaded ? (
          <>
            <Typography variant='h5'>{`${percentaseKelurahan}%`}</Typography>
            <Typography variant='body2' sx={{ color: 'text.disabled' }}>
              WEBSITE KELURAHAN
            </Typography>
            <ReactApexcharts type='radialBar' height={149} series={[percentaseKelurahan]} options={options} />
            <Typography variant='body2' sx={{ textAlign: 'center', color: 'text.disabled' }}>
              {`Jumlah Kelurahan: ${apiData.filter(item => item.jenis === 'kelurahan').length}`}
            </Typography>
            <Typography variant='body2' sx={{ textAlign: 'center', color: 'text.disabled' }}>
              {`Dari Total 14 Kelurahan`}
            </Typography>
          </>
        ) : (
          <Typography>Loading...</Typography>
        )}
      </CardContent>
    </Card>
  )
}

export default JumlahKelurahan
