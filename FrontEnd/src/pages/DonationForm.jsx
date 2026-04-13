import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Alert from '../components/Alert.jsx'
import Button from '../components/Button.jsx'
import Input from '../components/Input.jsx'
import Select from '../components/Select.jsx'
import Spinner from '../components/Spinner.jsx'
import Textarea from '../components/Textarea.jsx'
import api, { getErrorMessage } from '../services/api.js'
import { donationTypes } from '../utils/constants.js'

const initialForm = {
  name: '',
  donationType: 'food',
  quantity: 1,
  description: '',
  contactPhone: '',
  contactEmail: '',
}

function DonationForm({ mode }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const [form, setForm] = useState(initialForm)
  const [loading, setLoading] = useState(mode === 'edit')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (mode !== 'edit') return

    const loadDonation = async () => {
      setLoading(true)

      try {
        const { data } = await api.get(`/posts/${id}`)
        setForm({
          name: data.name || '',
          donationType: data.donationType,
          quantity: data.quantity,
          description: data.description || '',
          contactPhone: data.contactPhone || '',
          contactEmail: data.contactEmail || '',
        })
      } catch (err) {
        setError(getErrorMessage(err))
      } finally {
        setLoading(false)
      }
    }

    loadDonation()
  }, [id, mode])

  const update = (event) => setForm({ ...form, [event.target.name]: event.target.value })

  const submit = async (event) => {
    event.preventDefault()
    setSaving(true)
    setError('')

    const payload = { ...form, quantity: Number(form.quantity) }

    try {
      // The backend owns remainingQty and status, so the form only sends editable post fields.
      const { data } = mode === 'edit' ? await api.put(`/posts/${id}`, payload) : await api.post('/posts', payload)
      navigate(`/posts/${data._id}`)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <Spinner label="Loading donation form" />

  return (
    <section className="auth-page">
      <form className="form-card wide" onSubmit={submit}>
        <p className="eyebrow">Donor module</p>
        <h1>{mode === 'edit' ? 'Edit Donation' : 'Create Donation'}</h1>
        <Alert type="error">{error}</Alert>
        <div className="form-grid">
          <Select label="Donation type" id="donationType" name="donationType" value={form.donationType} onChange={update}>
            {donationTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </Select>
          <Input label="Donation name" id="donation-name" name="name" value={form.name} onChange={update} required />
          <Input label="Quantity" id="quantity" name="quantity" type="number" min="1" value={form.quantity} onChange={update} required />
          <Input label="Contact phone" id="contactPhone" name="contactPhone" value={form.contactPhone} onChange={update} />
          <Input label="Contact email" id="contactEmail" name="contactEmail" type="email" value={form.contactEmail} onChange={update} />
          <Textarea className="span-2" label="Description" id="description" name="description" rows="5" maxLength="1000" value={form.description} onChange={update} />
        </div>
        <Button type="submit" disabled={saving}>
          {saving ? 'Saving...' : 'Save donation'}
        </Button>
      </form>
    </section>
  )
}

export default DonationForm
