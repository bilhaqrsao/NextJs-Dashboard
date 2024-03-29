import { useState, useEffect } from 'react'
import axios from 'axios'
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Fade from '@mui/material/Fade'
import IconButton from '@mui/material/IconButton'
import Box from '@mui/material/Box'
import Collapse from '@mui/material/Collapse'
import Backdrop from '@mui/material/Backdrop'
import CircularProgress from '@mui/material/CircularProgress'
import Button from '@mui/material/Button'
import Icon from 'src/@core/components/icon'
import { useTheme } from '@mui/material/styles'
import JSONPretty from 'react-json-pretty'
import 'react-json-pretty/themes/monikai.css'

const DaftarApi = ({ data, activeTab, searchTerm, updateTableData, handleDeleteClick, handleEditClick }) => {
  const [reload, setReload] = useState(false)
  const [collapsedStates, setCollapsedStates] = useState({})
  const [visibility, setVisibility] = useState(true)
  const [apiResults, setApiResults] = useState({})
  const [loading, setLoading] = useState(false)
  const [visibleCollapseCount, setVisibleCollapseCount] = useState(10)
  const [showLess, setShowLess] = useState(false)
  const [reloadInProgress, setReloadInProgress] = useState(false)
  const [reloadingItem, setReloadingItem] = useState(null)
  const theme = useTheme()

  const handleBackDrop = async () => {
    setReloadInProgress(true)

    try {
      await Promise.all(
        filteredData.map(item => fetchDataForItem(item.id, item.url, item.endpoint, item.api_key, true))
      )
    } finally {
      setReloadInProgress(false)
    }
  }

  const fetchDataForItem = async (itemId, itemUrl, itemEndpoint, itemApiKey, forceRefresh = false) => {
    try {
      setReloadingItem(itemId) // Set state untuk menandakan bahwa item ini sedang dimuat ulang

      const fullUrl = `${itemUrl}${itemEndpoint}`
      console.log('Full URL:', fullUrl)

      if (forceRefresh || !apiResults[itemId]) {
        const response = await axios.get(fullUrl, {
          headers: {
            key: itemApiKey
          }
        })

        setApiResults(prevResults => ({
          ...prevResults,
          [itemId]: { url: itemUrl, endpoint: itemEndpoint, data: response.data }
        }))
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setReloadingItem(null) // Set state untuk menandakan bahwa pembaruan sudah selesai
    }
  }

  const handleCollapseToggle = async (itemId, itemUrl, itemEndpoint, itemApiKey) => {
    setCollapsedStates(prevStates => ({
      ...prevStates,
      [itemId]: !prevStates[itemId]
    }))

    if (!apiResults[itemId]) {
      await fetchDataForItem(itemId, itemUrl, itemEndpoint, itemApiKey)
    }
  }

  const filteredData = data.filter(item =>
    item.perangkat_daerah.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Grid container spacing={3} justifyContent='center'>
      {filteredData.slice(0, visibleCollapseCount).map((item, index) => (
        <Grid item key={index} xs={12} md={6} mt={4}>
          <Fade in={visibility} timeout={300}>
            <Card sx={{ position: 'relative', zIndex: theme.zIndex.mobileStepper - 1 }}>
              <CardHeader
                title={`${item.perangkat_daerah}`}
                action={
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <IconButton
                      size='small'
                      aria-label='collapse'
                      sx={{ mr: 2, color: 'text.secondary' }}
                      onClick={() => handleCollapseToggle(item.id, item.url, item.endpoint, item.api_key)}
                    >
                      <Icon
                        fontSize={20}
                        icon={!collapsedStates[item.id] ? 'tabler:chevron-down' : 'tabler:chevron-up'}
                      />
                    </IconButton>
                    <IconButton
                      size='small'
                      aria-label='reload'
                      onClick={handleBackDrop}
                      sx={{ mr: 2, color: 'text.secondary' }}
                    >
                      {reloadInProgress ? (
                        <CircularProgress size={20} color='inherit' />
                      ) : (
                        <Icon icon='tabler:reload' fontSize={20} />
                      )}
                    </IconButton>
                    <IconButton
                      size='small'
                      aria-label='delete'
                      onClick={() => handleDeleteClick(item.id)}
                      sx={{ mr: 2, color: 'error.main' }}
                    >
                      <Icon fontSize={20} icon='tabler:trash' />
                    </IconButton>
                    <IconButton
                      size='small'
                      aria-label='edit'
                      onClick={() => handleEditClick(item.id)}
                      sx={{ mr: 2, color: 'primary.main' }}
                    >
                      <Icon fontSize={20} icon='tabler:pencil' />
                    </IconButton>
                  </Box>
                }
              />
              <Collapse in={collapsedStates[item.id]}>
                <CardContent>
                  {/* Menampilkan CircularProgress hanya jika item sedang dimuat ulang */}
                  {reloadingItem === item.id && apiResults[item.id]?.loading && (
                    <Backdrop
                      open={true}
                      sx={{
                        position: 'absolute',
                        color: 'common.white',
                        zIndex: theme.zIndex.mobileStepper - 1,
                        backgroundColor: 'rgba(0, 0, 0, 0.5)' // Menambahkan latar belakang transparan
                      }}
                    >
                      <CircularProgress color='inherit' />
                    </Backdrop>
                  )}
                  {apiResults[item.id] ? (
                    <div>
                      <div>
                      <strong>URL:</strong> {apiResults[item.id].url}
                      {apiResults[item.id].endpoint}
                      </div>
                      <div>
                      <strong>API Key:</strong> {apiResults[item.id].data.api_key}
                      </div>
                      <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                      <JSONPretty data={apiResults[item.id].data} />
                      </div>
                      
                    </div>
                  ) : (
                    <JSONPretty data={{ message: 'Api Tidak Ditemukan' }} />
                  )}
                </CardContent>

                <Backdrop
                  open={reloadInProgress || reloadingItem !== null}
                  sx={{
                    position: 'absolute',
                    color: 'common.white',
                    zIndex: theme.zIndex.mobileStepper - 1,
                    backgroundColor: 'rgba(0, 0, 0, 0.5)' // Menambahkan latar belakang transparan
                  }}
                >
                  <CircularProgress color='inherit' />
                </Backdrop>
              </Collapse>
            </Card>
          </Fade>
        </Grid>
      ))}

      {visibleCollapseCount < data.length && !showLess && (
        <Grid item xs={12} mt={4} sx={{ textAlign: 'center' }}>
          <Button
            variant='contained'
            color='primary'
            onClick={() => {
              setVisibleCollapseCount(prevCount => prevCount + 5)
              setShowLess(true)
            }}
          >
            Load More
          </Button>
        </Grid>
      )}

      {showLess && (
        <Grid item xs={12} mt={4} sx={{ textAlign: 'center' }}>
          <Button
            variant='contained'
            color='secondary'
            onClick={() => {
              setVisibleCollapseCount(10)
              setShowLess(false)
            }}
          >
            Show Less
          </Button>
        </Grid>
      )}
    </Grid>
  )
}

export default DaftarApi
