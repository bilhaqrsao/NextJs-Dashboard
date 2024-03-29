import { useState, useEffect } from 'react'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import MenuItem from '@mui/material/MenuItem'
import axios from 'axios'

const DialogTambahDaftarApi = ({ open, onClose, fetchData, showAlert }) => {
  const [newData, setNewData] = useState({
    id_jenis_api: '',
    id_perangkat_daerah: '',
    endpoint: '',
    api_key: ''
  })

  const [jenisApiOptions, setJenisApiOptions] = useState([])
  const [perangkatDaerahOptions, setPerangkatDaerahOptions] = useState([])

  // State untuk menyimpan pesan kesalahan
  const [errorMessages, setErrorMessages] = useState({
    id_jenis_api: '',
    id_perangkat_daerah: '',
    endpoint: ''
  })

  const initialNewData = {
    id_jenis_api: '',
    id_perangkat_daerah: '',
    endpoint: '',
    api_key: ''
  }

  useEffect(() => {
    const fetchJenisApi = async () => {
      try {
        const response = await axios.get('http://newdashboard.bil/api/jenis-api', {
          headers: {
            key: '1234567890'
          }
        })

        if (response.data && Array.isArray(response.data.data)) {
          setJenisApiOptions(response.data.data)
        } else {
          console.error('Invalid data format from jenis-api API. Expecting an array.')
        }
      } catch (error) {
        console.error('Error fetching data from jenis-api API:', error)
      }
    }

    const fetchPerangkatDaerah = async () => {
      try {
        const response = await axios.get('http://newdashboard.bil/api/perangkat-daerah', {
          headers: {
            key: '1234567890'
          }
        })

        if (response.data && Array.isArray(response.data.data)) {
          setPerangkatDaerahOptions(response.data.data)
        } else {
          console.error('Invalid data format from perangkat-daerah API. Expecting an array.')
        }
      } catch (error) {
        console.error('Error fetching data from perangkat-daerah API:', error)
      }
    }

    fetchJenisApi()
    fetchPerangkatDaerah()
  }, [])

  const handleInputChange = (field, value) => {
    // Jika bidang yang diubah adalah "endpoint", tambahkan "/api/" pada awal value
    if (field === 'endpoint') {
      value = value.trim() // Hapus spasi di awal dan akhir
      if (value !== '' && !value.startsWith('/api/')) {
        value = '/api/' + value
      }
    }

    setNewData(prevData => ({
      ...prevData,
      [field]: value
    }))

    // Hapus pesan kesalahan jika pengguna mulai mengisi kembali
    setErrorMessages(prevErrors => ({
      ...prevErrors,
      [field]: ''
    }))
  }

  const handleTambahData = async () => {
    try {
      const response = await axios.post('http://newdashboard.bil/api/daftar-api', newData, {
        headers: {
          key: '1234567890'
        }
      })

      if (response.status === 201) {
        onClose()

        // Panggil fungsi fetchData yang diberikan sebagai properti
        if (fetchData) {
          fetchData()
        }

        // Reset state newData
        setNewData(initialNewData)
        showAlert('Data berhasil disimpan!')
      } else {
        console.error('Gagal menambahkan data. Status:', response.status)
      }
    } catch (error) {
      if (error.response && error.response.data) {
        const apiError = error.response.data

        if (apiError.error) {
          // Validasi error fields dan tampilkan pesan kesalahan sesuai respons API
          const fieldErrors = Object.entries(apiError.error).reduce((errors, [field, fieldErrors]) => {
            errors[field] = fieldErrors.join(', ')

            return errors
          }, {})

          // Update state pesan kesalahan
          setErrorMessages(fieldErrors)
        }
      } else {
        console.error('Error dalam melakukan HTTP POST:', error)
      }
    }
  }

  const handleClose = () => {
    // Reset nilai input saat menutup dialog
    setNewData(initialNewData)
    onClose()
  }

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>Tambah Daftar Dinas</DialogTitle>
      <DialogContent>
        <TextField
          select
          label='Jenis API'
          value={newData.id_jenis_api}
          onChange={e => handleInputChange('id_jenis_api', e.target.value)}
          fullWidth
          margin='normal'
          helperText={errorMessages.id_jenis_api}
          error={Boolean(errorMessages.id_jenis_api)}
        >
          {jenisApiOptions.map(option => (
            <MenuItem key={option.id} value={option.id}>
              {option.nama}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          select
          label='Perangkat Daerah'
          value={newData.id_perangkat_daerah}
          onChange={e => handleInputChange('id_perangkat_daerah', e.target.value)}
          fullWidth
          margin='normal'
          helperText={errorMessages.id_perangkat_daerah}
          error={Boolean(errorMessages.id_perangkat_daerah)}
        >
          {perangkatDaerahOptions.map(option => (
            <MenuItem key={option.id} value={option.id}>
              {option.nama}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          label='Endpoint'
          value={newData.endpoint}
          onChange={e => handleInputChange('endpoint', e.target.value)}
          fullWidth
          margin='normal'
          helperText={errorMessages.endpoint}
          error={Boolean(errorMessages.endpoint)}
        />
        <TextField
          label='Api Key'
          value={newData.api_key}
          onChange={e => handleInputChange('api_key', e.target.value)}
          fullWidth
          margin='normal'
          helperText={errorMessages.api_key}
          error={Boolean(errorMessages.api_key)}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Batal</Button>
        <Button onClick={handleTambahData} color='primary'>
          Tambah
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default DialogTambahDaftarApi
