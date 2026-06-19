import type { Metadata } from 'next'
import { ExternalLink, FileText } from 'lucide-react'
import { getPublications } from '@/lib/api'

export const metadata: Metadata = {
  title: 'Research | ZARD',
  description: 'Research areas, publications, and scholarly work of Innocent Tinashe Mutero.',
}

const AREAS = [
  {
    number: '01',
    title: 'African Cultural Economies & Music',
    desc: 'Examining how creative practice, music, and digital industries generate economic value and social meaning across Southern Africa. Current work focuses on Zimbabwean immigrants\' music-informed placemaking in Johannesburg, ZimDancehall micro-publics, and social media entrepreneurship in Zimbabwe\'s independent music economy.',
    themes: ['Migrant Placemaking', 'Music & Identity', 'Digital Creative Industries', 'Musicking', 'ZimDancehall'],
    citations: [
      { ref: 'Mutero (2026)', detail: 'Mediated music and well-being for Zimbabwean immigrants in South Africa. Muziki.' },
      { ref: 'Mutero (2025)', detail: 'Platformed cultural hustlers: Social media and entrepreneurship in Zimbabwe\'s independent music economy. African Music, 13(1).' },
      { ref: 'Mutero (2025)', detail: 'Reviving Zimbabwean traditional dance through popular youth culture. Southern African Journal of Folklore Studies.' },
      { ref: 'Mutero (2024)', detail: 'Zimbabweans in Johannesburg: Musicking, placemaking, and everyday citizenship. Social Dynamics.' },
    ],
  },
  {
    number: '02',
    title: 'Civic University & Community Engagement',
    desc: 'Research on how community–university partnerships generate socially embedded knowledge that drives inclusive wellbeing and local development. Grounded in community-based participatory research (CBPR) and critical service learning (CSL), developing frameworks for authentic partnership that honour shared agency.',
    themes: ['CBPR', 'Critical Service Learning', 'University–Community Partnership', 'Shared Agency', 'Applied Ethnomusicology'],
    citations: [
      { ref: 'Mutero & Chimbari (2021)', detail: 'Partnership dynamics in university–community engagement: A South African case study. International Journal of African Higher Education, 8(1).' },
      { ref: 'Mutero, Mchunu & Govender (2021)', detail: 'Sewing friendship: Increasing inclusivity through shared social spaces. Critical Studies in Teaching and Learning.' },
      { ref: 'Mutero & Govender (2020)', detail: 'Monitoring and evaluation of arts for social change. Journal of Asian and African Studies.' },
      { ref: 'Mutero & Govender (2019)', detail: 'Moving from transactional partnerships to collaborative community engagement. South African Review of Sociology.' },
    ],
  },
  {
    number: '03',
    title: 'Entrepreneurship Ecosystems & Digital Skills',
    desc: 'Research on entrepreneurial ecosystems, digital economy workforce transitions, and skills development in South Africa. Current PI on the FPM SETA-supported SkillUp Digital Project, examining workforce transition dynamics in South Africa\'s digital and green economy.',
    themes: ['Entrepreneurship', 'Digital Skills', 'SkillUp Digital', 'B-BBEE Policy', 'SETA'],
    citations: [
      { ref: 'Mutero & Marwa (2026)', detail: 'Mapping the global skills gap: An analysis of regional and sectoral challenges in a transforming global economy. International Journal of Research in Business and Social Science.' },
      { ref: 'Mutero & Govender (2019)', detail: 'Advancing the exploration of engaged creative-placemaking amongst universities and communities for social cohesion. Journal of Asian and African Studies.' },
    ],
  },
  {
    number: '04',
    title: 'Community Health & One Health',
    desc: 'Transdisciplinary research applying the One Health framework to public health and environmental challenges. Work includes digital mental health interventions for youth, community disease control, and stakeholder engagement in health crises across rural KwaZulu-Natal and Zimbabwe.',
    themes: ['One Health', 'Community Health', 'Youth Mental Health', 'Schistosomiasis', 'Stakeholder Engagement'],
    citations: [
      { ref: 'Chikanya, Mutero & Chimbari (2026)', detail: 'Adaptive governance and community agency in crisis: Stakeholder engagement in Seke District, Zimbabwe. INQUIRY: The Journal of Health Care.' },
      { ref: 'Mindu, Mutero et al. (2023)', detail: 'Digital mental health interventions for young people in rural South Africa. International Journal of Environmental Research and Public Health.' },
      { ref: 'Mutero et al. (2022)', detail: 'Engaging youth in stakeholder analysis for community-based digital innovations for mental health. Health & Social Care in the Community.' },
      { ref: 'Mutero & Chimbari (2021)', detail: 'Consulting the community on strategies to strengthen social capital for community disease control. International Quarterly of Community Health Education.' },
    ],
  },
  {
    number: '05',
    title: 'Conflict Transformation & Peace Studies',
    desc: 'Arts-based methodologies for conflict transformation, peace-building, and reconciliation. PhD research examined conflict transformation through music and dance in Mkoba, Gweru, Zimbabwe, with ongoing interest in endogenous arts-based peacebuilding in repressed environments.',
    themes: ['Arts for Peace', 'Conflict Transformation', 'Reconciliation', 'Music & Healing', 'Southern Africa'],
    citations: [
      { ref: 'Mutero & Kaye (2019)', detail: 'Music and conflict transformation in Zimbabwe. Peace Review, 31(3).' },
      { ref: 'Mutero (2018)', detail: 'Voices of dissent: Case study of the Rebel Woman, University of Zimbabwe. In Chinouriri & Kufakurinani (Eds.), Victors, Victims and Villains. University of Zimbabwe Publications.' },
      { ref: 'Mutero (2018)', detail: 'Performing subversion: The use of Chinyambera traditional dance as a coping mechanism in Zimbabwe. In Gimenez & Vambe (Eds.), Performing Zimbabwe. UKZN Press.' },
    ],
  },
]

export default async function ResearchPage() {
  const allPubs     = await getPublications()
  const articles    = allPubs.filter(p => p.type === 'article')
  const chapters    = allPubs.filter(p => p.type === 'chapter')
  const underReview = allPubs.filter(p => p.type === 'under-review')

  return (
    <>
      {/* ── Header ── */}
      <section className="pt-28 sm:pt-32" style={{ background: '#ffffff' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <span className="section-label mb-4">ZARD · Research</span>
          <div className="grid md:grid-cols-[1fr_auto] gap-10 items-end pb-12" style={{ borderBottom: '1px solid #e0e0e0' }}>
            <div>
              <h1 className="font-playfair leading-none mb-5" style={{ fontSize: 'clamp(2.6rem, 7vw, 5rem)', color: '#111111' }}>
                Scholarly Work &amp;<br />Research Interests
              </h1>
              <p className="font-inter text-[15px] leading-relaxed max-w-xl" style={{ color: '#555555' }}>
                Interdisciplinary research at the intersection of African cultural economies,
                civic university theory, and participatory research — grounded in community
                practice and oriented toward inclusive development.
              </p>
            </div>
            <div className="hidden md:flex flex-col gap-3 pb-1">
              {AREAS.map(({ title, number }) => (
                <a key={number} href={`#area-${number}`} className="flex items-center gap-2.5 font-inter text-[9px] tracking-[0.22em] uppercase transition-colors hover:text-[#333333]" style={{ color: '#888888' }}>
                  <span style={{ color: '#cccccc' }}>{number}</span>{title}
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Research Areas ── */}
      <section className="py-4" style={{ background: '#f6f6f6' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          {AREAS.map(({ number, title, desc, themes, citations }) => (
            <div key={number} id={`area-${number}`} className="grid md:grid-cols-[160px_1fr] gap-8 md:gap-16 py-12 md:py-16" style={{ borderBottom: '1px solid #e0e0e0' }}>
              <div className="flex flex-col items-start">
                <span className="font-inter font-black leading-none select-none" style={{ fontSize: '5rem', color: '#e8e8e8', letterSpacing: '-0.04em' }} aria-hidden="true">{number}</span>
                <div className="w-8 h-[2px] mt-3" style={{ background: '#cccccc' }} />
              </div>
              <div>
                <h2 className="font-playfair leading-tight mb-6" style={{ fontSize: 'clamp(1.5rem, 2.5vw, 2.1rem)', color: '#111111' }}>{title}</h2>
                <p className="font-inter text-[15px] leading-relaxed mb-8 max-w-2xl" style={{ color: '#444444' }}>{desc}</p>
                <div className="flex flex-wrap gap-2 mb-10">
                  {themes.map(theme => (
                    <span key={theme} className="font-inter text-[8px] tracking-[0.2em] uppercase px-3 py-1.5 transition-colors hover:border-[#999999] hover:text-[#333333]" style={{ border: '1px solid #d0d0d0', color: '#555555' }}>
                      {theme}
                    </span>
                  ))}
                </div>
                {/* Citations */}
                <div>
                  <p className="font-inter text-[9px] tracking-[0.28em] uppercase mb-4" style={{ color: '#aaaaaa' }}>Key Citations</p>
                  <div className="space-y-3">
                    {citations.map((c, i) => (
                      <div key={i} className="flex gap-4 py-3" style={{ borderTop: '1px solid #ebebeb' }}>
                        <span
                          className="flex-shrink-0 font-inter text-[9px] tracking-[0.12em] uppercase px-2.5 py-1 self-start"
                          style={{ border: '1px solid #d8d8d8', color: '#777777', whiteSpace: 'nowrap' }}
                        >
                          {c.ref}
                        </span>
                        <p className="font-inter text-[13px] leading-snug italic" style={{ color: '#555555' }}>
                          {c.detail}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Publications ── */}
      <section className="py-20" style={{ background: '#ffffff', borderTop: '1px solid #e0e0e0' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="grid md:grid-cols-[180px_1fr] gap-8 md:gap-16">
            <div className="md:sticky md:top-28 pt-1 flex flex-col gap-2">
              <span className="section-label">Publications</span>
              <p className="font-inter text-[10px] uppercase tracking-[0.2em] mt-3" style={{ color: '#999999', lineHeight: 1.6 }}>
                h-index 7 · 198 citations<br />Google Scholar · June 2026
              </p>
            </div>

            <div>
              {/* Journal Articles */}
              <div className="flex items-center justify-between pb-4 mb-8" style={{ borderBottom: '1px solid #e0e0e0' }}>
                <h2 className="font-inter font-black tracking-tight" style={{ fontSize: '1.1rem', color: '#111111' }}>Journal Articles</h2>
                <span className="font-inter text-[9px] tracking-[0.22em] uppercase" style={{ color: '#999999' }}>{articles.length} articles</span>
              </div>

              <div className="mb-16">
                {articles.map((pub, i) => (
                  <div key={pub.id} className="grid md:grid-cols-[52px_1fr] gap-6 py-7" style={{ borderBottom: '1px solid #ebebeb' }}>
                    <span className="font-inter font-black leading-none select-none hidden md:block" style={{ fontSize: '1.8rem', color: '#e8e8e8', letterSpacing: '-0.05em', paddingTop: '0.15rem' }} aria-hidden="true">
                      {String(articles.length - i).padStart(2, '0')}
                    </span>
                    <div>
                      <p className="font-playfair leading-snug mb-2" style={{ fontSize: 'clamp(0.95rem, 1.5vw, 1.1rem)', color: '#111111' }}>{pub.title}</p>
                      <p className="font-inter text-[12px] mb-2" style={{ color: '#666666' }}>{pub.authors}</p>
                      <div className="flex items-center gap-3 flex-wrap mb-3">
                        {pub.year && <span className="font-inter text-[9px] tracking-[0.18em] uppercase px-2.5 py-1" style={{ border: '1px solid #d0d0d0', color: '#666666' }}>{pub.year}</span>}
                        <span className="font-inter text-[11px] italic" style={{ color: '#777777' }}>{pub.venue}</span>
                      </div>
                      {/* Links */}
                      {(pub.scholarUrl || pub.pdfUrl || pub.doi) && (
                        <div className="flex items-center gap-3 flex-wrap">
                          {pub.scholarUrl && (
                            <a href={pub.scholarUrl} target="_blank" rel="noopener"
                              className="inline-flex items-center gap-1.5 font-inter text-[9px] tracking-[0.12em] uppercase transition-colors hover:text-[#111111]"
                              style={{ color: '#555555', border: '1px solid #d5d5d5', padding: '3px 8px' }}>
                              <ExternalLink size={9} />Google Scholar
                            </a>
                          )}
                          {pub.pdfUrl && (
                            <a href={pub.pdfUrl} target="_blank" rel="noopener"
                              className="inline-flex items-center gap-1.5 font-inter text-[9px] tracking-[0.12em] uppercase transition-colors hover:text-[#111111]"
                              style={{ color: '#555555', border: '1px solid #d5d5d5', padding: '3px 8px' }}>
                              <FileText size={9} />PDF
                            </a>
                          )}
                          {pub.doi && (
                            <a href={pub.doi.startsWith('http') ? pub.doi : `https://doi.org/${pub.doi}`}
                              target="_blank" rel="noopener"
                              className="inline-flex items-center gap-1 font-inter text-[9px] tracking-[0.12em] uppercase transition-colors hover:text-[#111111]"
                              style={{ color: '#888888' }}>
                              DOI ↗
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Book Chapters */}
              <div className="flex items-center justify-between pb-4 mb-8" style={{ borderBottom: '1px solid #e0e0e0' }}>
                <h2 className="font-inter font-black tracking-tight" style={{ fontSize: '1.1rem', color: '#111111' }}>Book Chapters</h2>
                <span className="font-inter text-[9px] tracking-[0.22em] uppercase" style={{ color: '#999999' }}>{chapters.length} chapters</span>
              </div>

              <div>
                {chapters.map((ch, i) => (
                  <div key={ch.id} className="grid md:grid-cols-[52px_1fr] gap-6 py-7" style={{ borderBottom: '1px solid #ebebeb' }}>
                    <span className="font-inter font-black leading-none select-none hidden md:block" style={{ fontSize: '1.8rem', color: '#e8e8e8', letterSpacing: '-0.05em', paddingTop: '0.15rem' }} aria-hidden="true">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <div>
                      <p className="font-playfair leading-snug mb-2" style={{ fontSize: 'clamp(0.95rem, 1.5vw, 1.1rem)', color: '#111111' }}>{ch.title}</p>
                      <p className="font-inter text-[12px] mb-2" style={{ color: '#666666' }}>{ch.authors}</p>
                      <div className="flex items-start gap-3 flex-wrap mb-3">
                        {ch.year && <span className="font-inter text-[9px] tracking-[0.18em] uppercase px-2.5 py-1 flex-shrink-0" style={{ border: '1px solid #d0d0d0', color: '#666666' }}>{ch.year}</span>}
                        <span className="font-inter text-[11px] italic leading-relaxed" style={{ color: '#777777' }}>{ch.venue}</span>
                      </div>
                      {(ch.scholarUrl || ch.pdfUrl || ch.doi) && (
                        <div className="flex items-center gap-3 flex-wrap">
                          {ch.scholarUrl && (
                            <a href={ch.scholarUrl} target="_blank" rel="noopener"
                              className="inline-flex items-center gap-1.5 font-inter text-[9px] tracking-[0.12em] uppercase transition-colors hover:text-[#111111]"
                              style={{ color: '#555555', border: '1px solid #d5d5d5', padding: '3px 8px' }}>
                              <ExternalLink size={9} />Google Scholar
                            </a>
                          )}
                          {ch.pdfUrl && (
                            <a href={ch.pdfUrl} target="_blank" rel="noopener"
                              className="inline-flex items-center gap-1.5 font-inter text-[9px] tracking-[0.12em] uppercase transition-colors hover:text-[#111111]"
                              style={{ color: '#555555', border: '1px solid #d5d5d5', padding: '3px 8px' }}>
                              <FileText size={9} />PDF
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Under Review */}
              {underReview.length > 0 && (
                <div className="mt-10 pt-7" style={{ borderTop: '1px solid #e0e0e0' }}>
                  <span className="section-label mb-6 block">Under Review / In Press</span>
                  <ul className="space-y-4">
                    {underReview.map(item => (
                      <li key={item.id} className="flex items-start gap-3">
                        <div className="w-[3px] h-3 rounded-full flex-shrink-0 mt-1.5" style={{ background: '#cccccc' }} />
                        <div>
                          <span className="font-inter text-[13px] italic leading-relaxed" style={{ color: '#666666' }}>
                            {item.title}
                          </span>
                          {item.venue && (
                            <span className="font-inter text-[11px] ml-2" style={{ color: '#aaaaaa' }}>
                              — {item.venue}
                            </span>
                          )}
                          {item.scholarUrl && (
                            <a href={item.scholarUrl} target="_blank" rel="noopener"
                              className="inline-flex items-center gap-1 ml-3 font-inter text-[9px] tracking-[0.1em] uppercase transition-colors hover:text-[#111111]"
                              style={{ color: '#888888' }}>
                              <ExternalLink size={8} />Scholar
                            </a>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
