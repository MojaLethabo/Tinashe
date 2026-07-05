import type { Metadata } from 'next'
import Image from 'next/image'
import { GraduationCap, Briefcase, Globe } from 'lucide-react'
import { WAVEFORM_BARS } from '@/lib/episodes'

export const metadata: Metadata = {
  title: 'About | ZARD',
  description: 'Biography and academic background of Innocent Tinashe Mutero — interdisciplinary scholar, Research & M&E Lead at the Johannesburg Business School Centre for Entrepreneurship, University of Johannesburg.',
}

const education = [
  { degree: 'Doctor of Music (DMus) — Ethnomusicology', institution: 'University of Pretoria', year: '2025', country: 'South Africa' },
  { degree: 'PhD — Public Administration', institution: 'Durban University of Technology', year: '2017', country: 'South Africa' },
  { degree: 'MA — Applied Ethnomusicology', institution: 'University of KwaZulu-Natal', year: '2014', country: 'South Africa' },
  { degree: 'BSS Honours (First Class) — Music & Musicology', institution: 'Midlands State University', year: '2011', country: 'Zimbabwe' },
]

const experience = [
  { role: 'Research & M&E Lead', org: 'JBS Centre for Entrepreneurship, University of Johannesburg', duration: '2026–Present' },
  { role: 'Lecturer — African Music and Dance', org: 'University of KwaZulu-Natal', duration: '2024–2025' },
  { role: 'Research Consultant', org: 'ZARD', duration: '2022–2025' },
  { role: 'Researcher — One Health Project', org: 'University of KwaZulu-Natal', duration: '2021–2022' },
  { role: 'Researcher — Community Engagement', org: 'Mangosuthu University of Technology', duration: '2020' },
  { role: 'Researcher — University Community Engagement', org: 'Durban University of Technology', duration: '2018' },
  { role: 'Lecturer — English for Musicians', org: 'University of KwaZulu-Natal', duration: '2014–2017' },
]

const interests = [
  'Civic University', 'African Cultural Economies', 'Migrant Placemaking & Music',
  'Digital Creative Industries', 'Community-Based Participatory Research (CBPR)',
  'Critical Service Learning (CSL)', 'Entrepreneurship Ecosystems',
  'M&E in Higher Education Programmes',
]

export default function AboutPage() {
  return (
    <>
      {/* ── Header ── */}
      <section className="pt-28 sm:pt-32" style={{ background: '#ffffff' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <span className="section-label mb-4">ZARD · About</span>

          <div className="grid md:grid-cols-[1fr_auto] gap-8 md:gap-12 items-end pb-10 sm:pb-12" style={{ borderBottom: '1px solid #e0e0e0' }}>
            <div>
              <h1 className="font-playfair leading-none mb-4" style={{ fontSize: 'clamp(2.2rem, 7vw, 5rem)', color: '#111111' }}>
                Innocent<br />Tinashe Mutero
              </h1>
              <p className="font-inter text-[11px] tracking-[0.25em] uppercase mb-6" style={{ color: '#777777' }}>
                PhD (Public Administration) · DMus (Ethnomusicology)
              </p>
              <div className="flex flex-wrap gap-2">
                {['Ethnomusicologist', 'Researcher', 'M&E Lead', 'Educator', 'Grant Writer'].map(t => (
                  <span key={t} className="font-inter text-[8px] tracking-[0.22em] uppercase px-3 py-1.5" style={{ border: '1px solid #d5d5d5', color: '#555555' }}>
                    {t}
                  </span>
                ))}
              </div>
            </div>

            <div className="hidden md:block flex-shrink-0">
              <div className="relative overflow-hidden" style={{ width: 176, height: 216, background: '#f5f5f5', border: '1px solid #e0e0e0' }}>
                <Image
                  src="/Pictures/Mutero.jpeg"
                  alt="Innocent Tinashe Mutero"
                  fill
                  sizes="176px"
                  style={{ objectFit: 'cover' }}
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Biography ── */}
      <section className="py-14 sm:py-20" style={{ background: '#f6f6f6' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="grid md:grid-cols-[180px_1fr] gap-8 md:gap-16">
            <span className="section-label md:sticky md:top-28 pt-1">Biography</span>
            <div className="max-w-2xl">
              <p className="font-playfair leading-snug mb-8 pb-8 sm:mb-10 sm:pb-10" style={{ fontSize: 'clamp(1.1rem, 2vw, 1.35rem)', borderBottom: '1px solid #e0e0e0', color: '#111111' }}>
                Interdisciplinary scholar at the intersection of African cultural economies,
                civic university theory, and participatory research.
              </p>
            <div className="space-y-5 font-inter text-[15px] leading-relaxed" style={{ color: '#333333' }}>
              <p>
                Innocent Tinashe Mutero holds two doctorates: a DMus in Ethnomusicology (University of Pretoria, 2025) and a PhD in Public Administration (Durban University of Technology, 2017). His work focuses on how community knowledge systems, higher education, and entrepreneurial ecosystems interact to produce forms of socially embedded knowledge that support inclusive development and wellbeing.
              </p>
              <p>
                His research is interdisciplinary, spanning ethnomusicology, urban and development studies, public health, and entrepreneurship, with a consistent focus on applied, community-engaged scholarship and practice-led inquiry. He has contributed to and led research projects supported by national and international partners across development, health, and creative sectors, with an emphasis on collaborative knowledge production and implementation in complex social settings.
              </p>
              <p>
                He is Research and Monitoring &amp; Evaluation Lead at the Johannesburg Business School Centre for Entrepreneurship, University of Johannesburg, where he works on skills development and innovation programming, including leadership of the FPM SETA-supported SkillUp Digital Project and coordination of institutional skills engagement platforms. He also supervises postgraduate research across multiple South African higher education institutions, including AFDA, Durban University of Technology, and the University of KwaZulu-Natal.
              </p>
            </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Credentials ── */}
      <section className="py-14 sm:py-20" style={{ background: '#f2f2f2' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="grid md:grid-cols-[180px_1fr] gap-8 md:gap-16">
            <span className="section-label md:sticky md:top-28 pt-1">Credentials</span>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-px" style={{ background: '#d8d8d8' }}>

              {/* Education */}
              <div className="px-5 sm:px-7 py-7 sm:py-8" style={{ background: '#f2f2f2' }}>
                <div className="flex items-center gap-2 mb-6 pb-4" style={{ borderBottom: '1px solid #e0e0e0' }}>
                  <GraduationCap size={13} strokeWidth={2} style={{ color: '#777777' }} />
                  <p className="font-inter text-[9px] tracking-[0.28em] uppercase" style={{ color: '#777777' }}>Education</p>
                </div>
                <div className="space-y-5 sm:space-y-6">
                  {education.map(({ degree, institution, year, country }) => (
                    <div key={degree} className="pl-4" style={{ borderLeft: '2px solid #cccccc' }}>
                      <p className="font-inter text-[12px] font-semibold leading-snug mb-1" style={{ color: '#111111' }}>{degree}</p>
                      <p className="font-inter text-[11px]" style={{ color: '#555555' }}>{institution}</p>
                      <p className="font-inter text-[10px] mt-0.5" style={{ color: '#888888' }}>{country} · {year}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Experience */}
              <div className="px-5 sm:px-7 py-7 sm:py-8" style={{ background: '#f2f2f2' }}>
                <div className="flex items-center gap-2 mb-6 pb-4" style={{ borderBottom: '1px solid #e0e0e0' }}>
                  <Briefcase size={13} strokeWidth={2} style={{ color: '#777777' }} />
                  <p className="font-inter text-[9px] tracking-[0.28em] uppercase" style={{ color: '#777777' }}>Experience</p>
                </div>
                <div className="space-y-5 sm:space-y-6">
                  {experience.map(({ role, org, duration }) => (
                    <div key={role + org} className="pl-4" style={{ borderLeft: '2px solid #cccccc' }}>
                      <p className="font-inter text-[12px] font-semibold leading-snug mb-1" style={{ color: '#111111' }}>{role}</p>
                      <p className="font-inter text-[11px]" style={{ color: '#555555' }}>{org}</p>
                      <p className="font-inter text-[10px] mt-0.5" style={{ color: '#888888' }}>{duration}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Research Interests */}
              <div className="px-5 sm:px-7 py-7 sm:py-8" style={{ background: '#f2f2f2' }}>
                <div className="flex items-center gap-2 mb-6 pb-4" style={{ borderBottom: '1px solid #e0e0e0' }}>
                  <Globe size={13} strokeWidth={2} style={{ color: '#777777' }} />
                  <p className="font-inter text-[9px] tracking-[0.28em] uppercase" style={{ color: '#777777' }}>Research Interests</p>
                </div>
                <div style={{ borderTop: '1px solid #ebebeb' }}>
                  {interests.map(item => (
                    <div key={item} className="py-2.5 flex items-center gap-3" style={{ borderBottom: '1px solid #ebebeb' }}>
                      <div className="w-[3px] h-3 rounded-full flex-shrink-0" style={{ background: '#cccccc' }} />
                      <span className="font-inter text-[12px]" style={{ color: '#333333' }}>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}