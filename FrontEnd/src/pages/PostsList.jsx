import { useMemo, useState } from 'react'
import Alert from '../components/Alert.jsx'
import PostCard from '../components/PostCard.jsx'
import Select from '../components/Select.jsx'
import Spinner from '../components/Spinner.jsx'
import { usePosts } from '../hooks/usePosts.js'
import { donationTypes, sortOptions } from '../utils/constants.js'

function PostsList() {
  const [filters, setFilters] = useState({ type: '', search: '', sort: 'newest' })
  const params = useMemo(
    () => ({
      type: filters.type || undefined,
      search: filters.search || undefined,
      sort: filters.sort,
    }),
    [filters],
  )
  const { posts, loading, error } = usePosts(params)

  const update = (event) => setFilters({ ...filters, [event.target.name]: event.target.value })

  return (
    <section className="stack">
      <div className="page-head">
        <div>
          <p className="eyebrow">Available donation feed</p>
          <h1>Browse Donations</h1>
          <p>Filter by type, search descriptions, and sort by date or remaining quantity.</p>
        </div>
      </div>

      <div className="filters">
        <label className="field">
          <span>Search</span>
          <input name="search" placeholder="Search description" value={filters.search} onChange={update} />
        </label>
        <Select label="Type" id="type" name="type" value={filters.type} onChange={update}>
          <option value="">All types</option>
          {donationTypes.map((type) => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </Select>
        <Select label="Sort" id="sort" name="sort" value={filters.sort} onChange={update}>
          {sortOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
      </div>

      <Alert type="error">{error}</Alert>
      {loading ? <Spinner label="Loading donations" /> : null}
      {!loading && posts.length === 0 ? <Alert>No available donations found.</Alert> : null}
      <div className="card-grid">
        {posts.map((post) => (
          <PostCard key={post._id} donation={post} />
        ))}
      </div>
    </section>
  )
}

export default PostsList
