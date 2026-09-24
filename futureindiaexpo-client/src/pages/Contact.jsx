import { useState } from 'react'
import { api, errorMessage } from '../api/client'
import { Breadcrumb, Feedback } from '../components/Common'
import { useAuth } from '../hooks/useAuth'

// welcome/contact.php
export default function Contact() {
  const { site } = useAuth()
  const contact = site.contact ?? {}
  const [feedback, setFeedback] = useState(null)

  // The PHP inputs had ids but no names, so the handler received nothing; values are read by id.
  const submit = async (event) => {
    event.preventDefault()
    const el = event.currentTarget.elements
    try {
      const { data } = await api.post('/contact', {
        name: el.cname.value,
        email: el.cemail.value,
        phone: el.cphone.value,
        subject: el.csubject.value,
        message: el.cmessage.value,
      })
      event.target.reset()
      setFeedback({ type: 'alert-success', message: data.message })
    } catch (err) {
      setFeedback({ type: 'alert-danger', message: errorMessage(err) })
    }
  }

  return (
    <main className="main">
      <Breadcrumb current="Contact us" className="breadcrumb-nav border-0 mb-0" />
      <div className="container">
        <div className="page-header page-header-big text-center" style={{ backgroundImage: "url('/assets/welcome/images/contact-header-bg.jpg')" }}>
          <h1 className="page-title text-white">Contact us<span className="text-white">keep in touch with us</span></h1>
        </div>
      </div>

      <div className="page-content pb-0">
        <div className="container">
          <div className="row">
            <div className="col-lg-6 mb-2 mb-lg-0">
              <h2 className="title mb-1">Contact Information</h2>
              <p className="mb-3">Get in touch with us anytime through phone, email, or our online form. Our support team is ready to assist you with your queries and provide quick solutions.</p>
              <div className="row">
                <div className="col-sm-7">
                  <div className="contact-info">
                    <h3>The Office</h3>

                    <ul className="contact-list">
                      <li>
                        <i className="icon-map-marker"></i>
                        {contact.address}
                      </li>
                      <li>
                        <i className="icon-phone"></i>
                        <a href={`tel:+91${contact.mobile_no ?? ''}`}>+91-{contact.mobile_no}</a>
                      </li>
                      <li>
                        <i className="icon-envelope"></i>
                        <a href={`mailto:${contact.email ?? ''}`}>{contact.email}</a>
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="col-sm-5">
                  <div className="contact-info">
                    <h3>The Office</h3>

                    <ul className="contact-list">
                      <li>
                        <i className="icon-clock-o"></i>
                        <span className="text-dark">Monday-Saturday</span> <br />11am-7pm ET
                      </li>
                      <li>
                        <i className="icon-calendar"></i>
                        <span className="text-dark">Sunday</span> <br />11am-6pm ET
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-lg-6">
              <h2 className="title mb-1">Got Any Questions?</h2>
              <p className="mb-2">Use the form below to get in touch with the sales team</p>

              <Feedback feedback={feedback} onClose={() => setFeedback(null)} />
              <form onSubmit={submit} className="contact-form mb-3">
                <div className="row">
                  <div className="col-sm-6">
                    <label htmlFor="cname" className="sr-only">Name</label>
                    <input type="text" className="form-control" id="cname" placeholder="Name *" required />
                  </div>

                  <div className="col-sm-6">
                    <label htmlFor="cemail" className="sr-only">Email</label>
                    <input type="email" className="form-control" id="cemail" placeholder="Email *" required />
                  </div>
                </div>

                <div className="row">
                  <div className="col-sm-6">
                    <label htmlFor="cphone" className="sr-only">Phone</label>
                    <input type="tel" className="form-control" id="cphone" placeholder="Phone" />
                  </div>

                  <div className="col-sm-6">
                    <label htmlFor="csubject" className="sr-only">Subject</label>
                    <input type="text" className="form-control" id="csubject" placeholder="Subject" />
                  </div>
                </div>

                <label htmlFor="cmessage" className="sr-only">Message</label>
                <textarea className="form-control" cols="30" rows="4" id="cmessage" required placeholder="Message *"></textarea>

                <button type="submit" className="btn btn-outline-primary-2 btn-minwidth-sm">
                  <span>SUBMIT</span>
                  <i className="icon-long-arrow-right"></i>
                </button>
              </form>
            </div>
          </div>
        </div>
        <div>
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d7141.347496280634!2d74.54241707770997!3d26.49844750000001!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x396bdd00fc907d5d%3A0x6d57616ad4869a20!2sFuture%20India%20Exports!5e0!3m2!1sen!2sin!4v1756365105790!5m2!1sen!2sin"
            width="100%"
            height="450"
            style={{ border: 0 }}
            allowFullScreen=""
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Future India Exports map"
          ></iframe>
        </div>
      </div>
    </main>
  )
}
