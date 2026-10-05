// Editorial content tree: cancer -> type -> subtype (any depth).
// `term` is the condition keyword sent to trial registries and literature indexes.
// POC content: must be reviewed by a qualified hematologist/oncologist before public launch.
// Home page focus. null = all cancers on the home page; 'leukemia' = the original leukemia-focused home page.
window.SITE_CONFIG = { homeFocus: null };

window.CANCERS = [
  {
    slug: 'leukemia',
    name: 'Leukemia',
    term: 'Leukemia',
    tagline: 'Cancers of the blood and bone marrow, grouped by how fast they grow and which blood cell line they start in.',
    overview: [
      'Leukemia is a group of cancers that begin in the blood-forming cells of the bone marrow. Abnormal white blood cells build up, crowd out healthy blood cells, and spill into the bloodstream.',
      'Doctors classify leukemia along two lines: how quickly it progresses (acute or chronic) and which cell family it starts in (lymphoid or myeloid). That gives four main types (ALL, AML, CLL and CML), plus several rarer forms. Each behaves differently and is treated differently, which is why knowing the exact type and its genetic features matters so much.'
    ],
    facts: [
      'Leukemia is the most common cancer in children; most childhood cases are acute lymphoblastic leukemia (ALL).',
      'In adults, acute myeloid leukemia (AML) and chronic lymphocytic leukemia (CLL) are the most frequently diagnosed types in Western countries.',
      'Diagnosis relies on blood counts, bone marrow examination, flow cytometry and genetic testing of the leukemia cells.',
      'Treatment has shifted over the past two decades from chemotherapy alone toward targeted drugs, antibody-based therapies, CAR T-cell therapy and stem cell transplantation.'
    ],
    global: 'Access to diagnostics, targeted drugs and transplantation varies widely between countries, and so do outcomes. Collaborative groups on every continent now run trials designed for their own patient populations and health systems.',
    sources: [
      ['NCI: Leukemia (PDQ summaries)', 'https://www.cancer.gov/types/leukemia'],
      ['IARC Global Cancer Observatory', 'https://gco.iarc.who.int/'],
      ['WHO Classification of Haematolymphoid Tumours', 'https://tumourclassification.iarc.who.int/']
    ],
    children: [
      {
        slug: 'all',
        name: 'Acute Lymphoblastic Leukemia',
        abbr: 'ALL',
        term: 'Acute Lymphoblastic Leukemia',
        tagline: 'A fast-growing leukemia of immature lymphoid cells; the most common childhood cancer.',
        overview: [
          'ALL starts in immature lymphocytes (lymphoblasts) and progresses quickly without treatment. It is the most common cancer in children, and also occurs in adults, where it is harder to cure.',
          'Treatment is given in phases over two to three years (induction, consolidation and maintenance), with therapy directed at the central nervous system. Response is tracked by measurable residual disease (MRD) testing, which guides how intensive treatment needs to be.'
        ],
        facts: [
          'In high-income countries, about 9 in 10 children with ALL are now long-term survivors; outcomes in adults are lower and improving.',
          'Genetic features of the leukemia cells (for example the Philadelphia chromosome, KMT2A rearrangements, hypodiploidy) strongly influence treatment choice.',
          'Immunotherapies (blinatumomab, inotuzumab ozogamicin and CD19-directed CAR T cells) have become important options, increasingly used earlier in treatment.',
          'Allogeneic stem cell transplantation is used for higher-risk or relapsed disease.'
        ],
        treatments: ['Multi-agent chemotherapy', 'CNS-directed therapy', 'Tyrosine kinase inhibitors (Ph+ ALL)', 'Blinatumomab', 'Inotuzumab ozogamicin', 'CAR T-cell therapy', 'Allogeneic stem cell transplant'],
        global: 'Childhood ALL survival differs sharply between high-income and low- and middle-income countries. National collaborative protocols, such as ICiCLe in India, GBTLI in Brazil, and the Chinese Children\'s Cancer Group studies, adapt treatment intensity to local resources and supportive care.',
        sources: [
          ['NCI: Adult ALL Treatment (PDQ)', 'https://www.cancer.gov/types/leukemia/hp/adult-all-treatment-pdq'],
          ['NCI: Childhood ALL Treatment (PDQ)', 'https://www.cancer.gov/types/leukemia/hp/child-all-treatment-pdq']
        ],
        children: [
          {
            slug: 'b-all', name: 'B-cell ALL', abbr: 'B-ALL', term: 'B-cell Acute Lymphoblastic Leukemia',
            tagline: 'The most common form of ALL, arising from B-lymphocyte precursors.',
            overview: ['B-cell ALL accounts for the large majority of ALL in both children and adults. Leukemia cells usually carry the surface markers CD19 and CD22, which are the targets of several modern immunotherapies.'],
            facts: [
              'Blinatumomab (CD19/CD3 bispecific antibody) and inotuzumab ozogamicin (anti-CD22 antibody–drug conjugate) are established treatments.',
              'CD19-directed CAR T-cell therapies are approved in several countries for relapsed or refractory disease.',
              '"Ph-like" B-ALL is a higher-risk genetic subgroup under active study with targeted drugs.'
            ],
            treatments: ['Chemotherapy', 'Blinatumomab', 'Inotuzumab ozogamicin', 'CD19 CAR T cells', 'Stem cell transplant']
          },
          {
            slug: 't-all', name: 'T-cell ALL', abbr: 'T-ALL', term: 'T-cell Acute Lymphoblastic Leukemia',
            tagline: 'A less common form of ALL arising from T-lymphocyte precursors.',
            overview: ['T-cell ALL makes up a minority of ALL cases and is somewhat more frequent in adolescents and young adults. It often presents with a high white cell count or a mass in the chest (mediastinum).'],
            facts: [
              'Intensive, pediatric-style chemotherapy is the backbone of treatment.',
              'Nelarabine is used for relapsed disease and, in some protocols, as part of first-line therapy.',
              'Fewer immunotherapy options exist than for B-ALL; CAR T cells for T-ALL (for example targeting CD7) are being tested in trials.'
            ],
            treatments: ['Intensive chemotherapy', 'Nelarabine', 'Stem cell transplant', 'Investigational CAR T cells']
          },
          {
            slug: 'ph-positive-all', name: 'Philadelphia Chromosome–Positive ALL', abbr: 'Ph+ ALL', term: 'Philadelphia Chromosome Positive Acute Lymphoblastic Leukemia',
            tagline: 'ALL driven by the BCR::ABL1 fusion gene; treated with tyrosine kinase inhibitors.',
            overview: ['In Ph+ ALL the leukemia cells carry the Philadelphia chromosome, which creates the BCR::ABL1 fusion gene. It becomes more common with age and is the most frequent genetic subtype of ALL in adults.'],
            facts: [
              'Once the highest-risk form of ALL, outcomes changed markedly after tyrosine kinase inhibitors (imatinib, dasatinib, ponatinib) were added to treatment.',
              'Chemotherapy-free or chemotherapy-light regimens combining a TKI with blinatumomab have shown strong results in trials, including studies led by the Italian GIMEMA group.',
              'The role of stem cell transplant in patients who reach deep molecular remission is being re-examined.'
            ],
            treatments: ['Tyrosine kinase inhibitors', 'Blinatumomab', 'Reduced-intensity chemotherapy', 'Stem cell transplant']
          }
        ]
      },
      {
        slug: 'aml',
        name: 'Acute Myeloid Leukemia',
        abbr: 'AML',
        term: 'Acute Myeloid Leukemia',
        tagline: 'A fast-growing leukemia of myeloid cells; the most common acute leukemia in adults.',
        overview: [
          'AML begins in immature myeloid cells and progresses rapidly. It is mainly a disease of older adults, though it occurs at every age. AML is not one disease: it is a collection of genetically defined subtypes with very different outlooks.',
          'Fit patients are typically offered intensive chemotherapy, often followed by stem cell transplantation depending on genetic risk. Patients who cannot tolerate intensive therapy are commonly treated with venetoclax combined with a hypomethylating agent.'
        ],
        facts: [
          'Most people are diagnosed in their 60s or later.',
          'Genetic testing at diagnosis (for example FLT3, NPM1, IDH1/2, TP53, and chromosome changes) determines risk group and which targeted drugs can be used.',
          'Targeted drugs now in use include FLT3 inhibitors, IDH1 and IDH2 inhibitors, and menin inhibitors for specific genetic subtypes.',
          'Allogeneic stem cell transplantation remains the main curative option for intermediate- and high-risk disease.'
        ],
        treatments: ['Intensive chemotherapy ("7+3")', 'Venetoclax + azacitidine', 'FLT3 inhibitors', 'IDH1/IDH2 inhibitors', 'Menin inhibitors', 'Allogeneic stem cell transplant'],
        global: 'Research on AML is strongly international: the European LeukemiaNet (ELN) risk classification is used worldwide, haploidentical ("half-matched") transplantation was advanced substantially by teams in Beijing, and the modern treatment of APL grew from work in Shanghai and Paris.',
        sources: [
          ['NCI: AML Treatment (PDQ)', 'https://www.cancer.gov/types/leukemia/hp/adult-aml-treatment-pdq'],
          ['European LeukemiaNet', 'https://www.leukemia-net.org/']
        ],
        children: [
          {
            slug: 'apl', name: 'Acute Promyelocytic Leukemia', abbr: 'APL', term: 'Acute Promyelocytic Leukemia',
            tagline: 'A distinct, highly curable AML subtype that is a medical emergency at diagnosis.',
            overview: ['APL is defined by the PML::RARA fusion gene, usually from a translocation between chromosomes 15 and 17. It can cause life-threatening bleeding and clotting problems at presentation, so treatment starts as soon as the diagnosis is suspected.'],
            facts: [
              'All-trans retinoic acid (ATRA) combined with arsenic trioxide cures the large majority of patients with standard-risk APL, often without conventional chemotherapy.',
              'This treatment approach originated from research in Shanghai, China, and was developed further with groups in France, Italy, Germany and elsewhere.',
              'Early death from bleeding before or just after starting treatment remains the main challenge, especially where diagnosis is delayed.'
            ],
            treatments: ['ATRA', 'Arsenic trioxide', 'Chemotherapy (high-risk disease)'],
            global: 'The International Consortium on APL (IC-APL) showed that networking hospitals in Brazil, Mexico, Chile and Uruguay around a shared protocol substantially improved survival, a model for collaborative care in resource-limited settings.'
          },
          {
            slug: 'flt3-aml', name: 'FLT3-Mutated AML', term: 'FLT3 mutated Acute Myeloid Leukemia',
            tagline: 'AML carrying FLT3-ITD or FLT3-TKD mutations, found in roughly a third of patients.',
            overview: ['Mutations in the FLT3 gene are among the most common in AML. FLT3-ITD mutations in particular are linked to a higher risk of relapse.'],
            facts: [
              'FLT3 inhibitors (midostaurin, quizartinib) are added to intensive chemotherapy for newly diagnosed patients.',
              'Gilteritinib is used for relapsed or refractory FLT3-mutated AML.',
              'Trials are testing FLT3 inhibitors in combination with venetoclax-based therapy and as maintenance after transplant.'
            ],
            treatments: ['Midostaurin', 'Quizartinib', 'Gilteritinib', 'Stem cell transplant']
          },
          {
            slug: 'npm1-aml', name: 'NPM1-Mutated AML', term: 'NPM1 mutated Acute Myeloid Leukemia',
            tagline: 'A common genetic subtype with generally favorable chemotherapy response.',
            overview: ['NPM1 mutations occur in roughly a third of adults with AML. Without a co-occurring FLT3-ITD mutation, the outlook after intensive chemotherapy is generally favorable.'],
            facts: [
              'NPM1 mutation levels can be tracked in blood or marrow as a sensitive measurable residual disease (MRD) marker.',
              'Menin inhibitors are a new targeted drug class active in NPM1-mutated and KMT2A-rearranged leukemia.'
            ],
            treatments: ['Intensive chemotherapy', 'Venetoclax-based therapy', 'Menin inhibitors', 'MRD-guided transplant']
          }
        ]
      },
      {
        slug: 'cll',
        name: 'Chronic Lymphocytic Leukemia',
        abbr: 'CLL',
        term: 'Chronic Lymphocytic Leukemia',
        tagline: 'A slow-growing leukemia of mature B lymphocytes, most common in older adults.',
        overview: [
          'CLL is a slow-growing cancer of mature B cells found in the blood, bone marrow and lymph nodes. Small lymphocytic lymphoma (SLL) is the same disease presenting mainly in lymph nodes.',
          'Many people have no symptoms at diagnosis and are monitored without treatment ("watch and wait"), sometimes for years. Treatment begins when the disease causes symptoms or low blood counts.'
        ],
        facts: [
          'Typically diagnosed around age 70; often discovered by chance on a routine blood test.',
          'Targeted oral drugs, namely BTK inhibitors (ibrutinib, acalabrutinib, zanubrutinib) and the BCL-2 inhibitor venetoclax, have largely replaced chemotherapy.',
          'IGHV mutation status and TP53 abnormalities (including deletion 17p) guide treatment choice.',
          'Fixed-duration combinations that allow time off treatment are a major focus of current trials.'
        ],
        treatments: ['Watch and wait', 'BTK inhibitors', 'Venetoclax + obinutuzumab', 'Non-covalent BTK inhibitors (pirtobrutinib)', 'CAR T-cell therapy (relapsed)'],
        global: 'CLL is the most common adult leukemia in Europe, North America and Australia but is much less common in East Asia. Large practice-changing trials have come from the German CLL Study Group, UK NCRI trials and international cooperative groups.',
        sources: [
          ['NCI: CLL Treatment (PDQ)', 'https://www.cancer.gov/types/leukemia/hp/cll-treatment-pdq'],
          ['iwCLL guidelines', 'https://www.iwcll.org/']
        ],
        children: [
          {
            slug: 'tp53-cll', name: 'CLL with del(17p) / TP53 Mutation', term: 'Chronic Lymphocytic Leukemia 17p deletion',
            tagline: 'A higher-risk genetic form of CLL that responds poorly to chemotherapy.',
            overview: ['Loss of part of chromosome 17 or mutation of the TP53 gene makes CLL cells resistant to chemoimmunotherapy. Testing for these changes is recommended before every line of treatment.'],
            facts: ['Targeted agents (BTK inhibitors, venetoclax-based regimens) are the preferred treatment.', 'Clinical trial participation is often encouraged for this group.'],
            treatments: ['BTK inhibitors', 'Venetoclax-based therapy', 'Clinical trials']
          },
          {
            slug: 'richter', name: 'Richter Transformation', term: 'Richter Syndrome',
            tagline: 'Transformation of CLL into an aggressive lymphoma.',
            overview: ['In a small proportion of patients, CLL transforms into a fast-growing lymphoma, most often diffuse large B-cell lymphoma. It typically causes rapidly enlarging lymph nodes, fever and weight loss.'],
            facts: ['Outcomes with standard chemoimmunotherapy are poor, so trials are a priority.', 'Approaches under study include targeted-drug combinations, immune checkpoint inhibitors, bispecific antibodies and CAR T cells.'],
            treatments: ['Chemoimmunotherapy', 'Stem cell transplant', 'Clinical trials']
          }
        ]
      },
      {
        slug: 'cml',
        name: 'Chronic Myeloid Leukemia',
        abbr: 'CML',
        term: 'Chronic Myeloid Leukemia',
        tagline: 'A leukemia driven by the BCR::ABL1 gene, transformed by daily targeted pills.',
        overview: [
          'CML is caused by the Philadelphia chromosome, which produces the BCR::ABL1 fusion gene. Most people are diagnosed in the slow-moving chronic phase.',
          'Tyrosine kinase inhibitors (TKIs), taken as daily tablets, block the BCR::ABL1 protein. For most patients diagnosed in chronic phase, life expectancy now approaches that of the general population.'
        ],
        facts: [
          'Available TKIs include imatinib, dasatinib, nilotinib, bosutinib, ponatinib and asciminib.',
          'Response is monitored by regular PCR blood tests measuring BCR::ABL1 levels on an international scale.',
          'Some patients with a sustained deep molecular response can stop treatment under close monitoring ("treatment-free remission").',
          'Advanced phases (accelerated and blast phase) are harder to treat and may need stem cell transplantation.'
        ],
        treatments: ['Imatinib', 'Second-generation TKIs', 'Ponatinib', 'Asciminib', 'Stem cell transplant (advanced phase)'],
        global: 'Generic imatinib and international access programs have widened availability of CML treatment in low- and middle-income countries, though access to molecular monitoring remains uneven.',
        sources: [
          ['NCI: CML Treatment (PDQ)', 'https://www.cancer.gov/types/leukemia/hp/cml-treatment-pdq'],
          ['European LeukemiaNet: CML recommendations', 'https://www.leukemia-net.org/']
        ],
        children: [
          {
            slug: 'cml-blast-phase', name: 'Blast-Phase CML', term: 'Chronic Myeloid Leukemia Blast Phase',
            tagline: 'Advanced CML that behaves like an acute leukemia.',
            overview: ['In blast phase, CML has acquired additional genetic changes and behaves like acute leukemia. It is now uncommon where TKIs and monitoring are readily available.'],
            facts: ['Treatment usually combines a potent TKI with acute-leukemia-type chemotherapy, aiming for stem cell transplant.', 'Clinical trials are testing newer TKI combinations.'],
            treatments: ['TKI + chemotherapy', 'Stem cell transplant', 'Clinical trials']
          },
          {
            slug: 'cml-t315i', name: 'TKI-Resistant CML (including T315I)', term: 'Chronic Myeloid Leukemia T315I',
            tagline: 'CML that has stopped responding to one or more TKIs.',
            overview: ['Resistance often arises from mutations in the BCR::ABL1 kinase domain. The T315I mutation blocks most TKIs.'],
            facts: ['Ponatinib and asciminib are active against T315I-mutated CML.', 'Mutation testing guides the choice of the next TKI.'],
            treatments: ['Ponatinib', 'Asciminib', 'Stem cell transplant']
          }
        ]
      },
      {
        slug: 'rare',
        name: 'Rarer Leukemias',
        term: 'Leukemia',
        group: true,
        tagline: 'Less common leukemias, each with its own biology and treatment.',
        overview: ['Beyond the four main types there are several rarer leukemias. Because each affects few patients, international collaboration and clinical trials are especially important for progress.'],
        facts: [],
        children: [
          {
            slug: 'hairy-cell', name: 'Hairy Cell Leukemia', abbr: 'HCL', term: 'Hairy Cell Leukemia',
            tagline: 'A rare, slow-growing B-cell leukemia with very effective treatments.',
            overview: ['Hairy cell leukemia is named for the fine projections seen on the leukemia cells under the microscope. It usually causes low blood counts and an enlarged spleen.'],
            facts: ['The BRAF V600E mutation is found in nearly all classic cases.', 'Purine analog chemotherapy (cladribine or pentostatin), often with rituximab, produces long remissions.', 'BRAF inhibitors are an option for relapsed disease.'],
            treatments: ['Cladribine', 'Pentostatin', 'Rituximab', 'BRAF inhibitors']
          },
          {
            slug: 'cmml', name: 'Chronic Myelomonocytic Leukemia', abbr: 'CMML', term: 'Chronic Myelomonocytic Leukemia',
            tagline: 'A disease of older adults with features of both myelodysplastic and myeloproliferative neoplasms.',
            overview: ['CMML is defined by a persistently raised monocyte count together with abnormal blood cell production. It can progress to AML.'],
            facts: ['Hypomethylating agents (azacitidine, decitabine) are the most commonly used drugs.', 'Allogeneic stem cell transplant is the only potentially curative treatment, for patients fit enough.'],
            treatments: ['Hypomethylating agents', 'Hydroxyurea', 'Stem cell transplant']
          },
          {
            slug: 'jmml', name: 'Juvenile Myelomonocytic Leukemia', abbr: 'JMML', term: 'Juvenile Myelomonocytic Leukemia',
            tagline: 'A rare leukemia of infants and young children.',
            overview: ['JMML is driven by mutations in the RAS signalling pathway (PTPN11, NRAS, KRAS, NF1, CBL). It mostly affects children under four years old.'],
            facts: ['Stem cell transplantation is the standard curative treatment for most children.', 'Some genetic subgroups (for example certain CBL-mutated cases) can resolve without transplant and are watched closely.'],
            treatments: ['Stem cell transplant', 'Azacitidine (bridging)', 'Clinical trials']
          },
          {
            slug: 't-pll', name: 'T-cell Prolymphocytic Leukemia', abbr: 'T-PLL', term: 'T-cell Prolymphocytic Leukemia',
            tagline: 'A rare and aggressive mature T-cell leukemia.',
            overview: ['T-PLL typically presents with a very high lymphocyte count, enlarged spleen and lymph nodes, and sometimes skin involvement.'],
            facts: ['The antibody alemtuzumab is the most effective initial treatment.', 'Stem cell transplant in first remission offers the best chance of durable control.'],
            treatments: ['Alemtuzumab', 'Stem cell transplant', 'Clinical trials']
          },
          {
            slug: 'lgl', name: 'Large Granular Lymphocytic Leukemia', abbr: 'LGL', term: 'Large Granular Lymphocytic Leukemia',
            tagline: 'A usually slow-growing leukemia of T cells or NK cells.',
            overview: ['LGL leukemia often causes low neutrophil counts or anemia and is associated with autoimmune conditions such as rheumatoid arthritis.'],
            facts: ['STAT3 mutations are common.', 'Treatment, when needed, uses low-dose immunosuppressive drugs such as methotrexate, cyclophosphamide or cyclosporine.'],
            treatments: ['Methotrexate', 'Cyclophosphamide', 'Cyclosporine']
          }
        ]
      }
    ]
  }
];

// Data-only cancers: live trials, country activity, research and statistics, with no written summary yet.
// Add `overview`, `facts`, etc. (with citations) to a node to turn it into a full page like leukemia.
(() => {
  const slugify = (s) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const N = (name, term, children, abbr) => ({ slug: slugify(abbr || name), name, abbr, term: term || name, children: children || [] });
  const add = (slug, name, term, children) => window.CANCERS.push({ slug, name, term, dataOnly: true, children });

  add('lymphoma', 'Lymphoma', 'Lymphoma', [
    N('Hodgkin Lymphoma'),
    N('Diffuse Large B-Cell Lymphoma', null, null, 'DLBCL'),
    N('Follicular Lymphoma'),
    N('Mantle Cell Lymphoma'),
    N('Marginal Zone Lymphoma'),
    N('Burkitt Lymphoma'),
    N('Peripheral T-Cell Lymphoma'),
    N('Cutaneous T-Cell Lymphoma'),
    N('Waldenström Macroglobulinemia', 'Waldenstrom Macroglobulinemia')
  ]);
  add('myeloma', 'Multiple Myeloma', 'Multiple Myeloma', [
    N('Newly Diagnosed Multiple Myeloma'),
    N('Relapsed or Refractory Multiple Myeloma', 'Relapsed Refractory Multiple Myeloma'),
    N('Smoldering Multiple Myeloma'),
    N('AL Amyloidosis')
  ]);
  add('breast', 'Breast Cancer', 'Breast Cancer', [
    N('Hormone Receptor–Positive Breast Cancer', 'Hormone Receptor Positive Breast Cancer'),
    N('HER2-Positive Breast Cancer', 'HER2-positive Breast Cancer'),
    N('Triple-Negative Breast Cancer', 'Triple Negative Breast Cancer'),
    N('Metastatic Breast Cancer'),
    N('Ductal Carcinoma In Situ', null, null, 'DCIS'),
    N('Inflammatory Breast Cancer'),
    N('Male Breast Cancer')
  ]);
  add('lung', 'Lung Cancer', 'Lung Cancer', [
    N('Non-Small Cell Lung Cancer', null, [
      N('EGFR-Mutated NSCLC', 'EGFR mutation Non-Small Cell Lung Cancer'),
      N('ALK-Positive NSCLC', 'ALK-positive Non-Small Cell Lung Cancer'),
      N('KRAS G12C–Mutated NSCLC', 'KRAS G12C Non-Small Cell Lung Cancer'),
      N('Squamous Cell Lung Cancer', 'Squamous Cell Lung Carcinoma')
    ], 'NSCLC'),
    N('Small Cell Lung Cancer', null, null, 'SCLC')
  ]);
  add('colorectal', 'Colorectal Cancer', 'Colorectal Cancer', [
    N('Colon Cancer'),
    N('Rectal Cancer'),
    N('Metastatic Colorectal Cancer'),
    N('MSI-High Colorectal Cancer', 'Microsatellite Instability High Colorectal Cancer')
  ]);
  add('prostate', 'Prostate Cancer', 'Prostate Cancer', [
    N('Localized Prostate Cancer'),
    N('Metastatic Hormone-Sensitive Prostate Cancer'),
    N('Castration-Resistant Prostate Cancer')
  ]);
  add('brain', 'Brain Tumors', 'Brain Tumor', [
    N('Glioblastoma'),
    N('Astrocytoma'),
    N('Oligodendroglioma'),
    N('Meningioma'),
    N('Medulloblastoma'),
    N('Ependymoma'),
    N('Diffuse Intrinsic Pontine Glioma', null, null, 'DIPG'),
    N('Brain Metastases')
  ]);
})();
