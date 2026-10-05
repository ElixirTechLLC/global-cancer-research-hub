// Country profiles. `stats` = leukaemia, both sexes, all ages, GLOBOCAN 2024 (IARC):
// [new cases, deaths, age-standardised incidence, age-standardised mortality per 100,000].
// `aff` = affiliation spellings used for literature search; `iso2` matches OpenAlex country codes.
// Links were checked on 2026-10-04. A null url means no official site could be confirmed.
// POC content: group descriptions need review by a medical/editorial board before public launch.
(() => {
  const S = (cases, deaths, asrInc, asrMort) => ({ cases, deaths, asrInc, asrMort });
  const L = (name, url) => ({ name, url });
  const G = (name, city, note, url, short) => ({ name, city, note, url, short });
  const CTIS = L('EU Clinical Trials Information System (CTIS)', 'https://euclinicaltrials.eu/');
  const PACTR = L('PACTR — Pan African Clinical Trials Registry', 'https://pactr.samrc.ac.za/');

  window.WORLD_STATS = {
    year: '2024', cases: '495,113', deaths: '292,234',
    source: 'IARC Global Cancer Observatory — Cancer Today (GLOBOCAN 2024 estimates)',
    sourceUrl: 'https://gco.iarc.who.int/today'
  };

  window.COUNTRIES = [
    // ---------------- Americas ----------------
    { code: 'US', name: 'United States', flag: '🇺🇸', region: 'Americas', aff: ['USA', 'United States'],
      stats: S(63566, 24193, 10.60, 2.93),
      registry: L('ClinicalTrials.gov', 'https://clinicaltrials.gov/'), regulator: L('Food and Drug Administration (FDA)', 'https://www.fda.gov/'),
      guideline: L('National Comprehensive Cancer Network (NCCN)', 'https://www.nccn.org/'), patientOrg: L('Blood Cancer United (formerly The Leukemia & Lymphoma Society)', 'https://bloodcancerunited.org/'),
      groups: [
        G('National Cancer Institute', 'Bethesda, Maryland', 'Federal cancer research agency; funds the National Clinical Trials Network cooperative groups and publishes the PDQ treatment summaries.', 'https://www.cancer.gov/', 'NCI'),
        G('Children\'s Oncology Group', 'Multi-center', 'Research network of more than 220 hospitals running trials for children, adolescents and young adults with cancer, including leukemia.', 'https://childrensoncologygroup.org/', 'COG'),
        G('MD Anderson Cancer Center — Department of Leukemia', 'Houston, Texas', 'One of the largest leukemia programs in the world, seeing over 2,000 new patients a year with more than 50 active trials.', 'https://www.mdanderson.org/research/departments-labs-institutes/departments-divisions/leukemia.html', 'MD Anderson'),
        G('St. Jude Children\'s Research Hospital', 'Memphis, Tennessee', 'Known for the "Total Therapy" studies in childhood ALL.', 'https://www.stjude.org/', 'St. Jude'),
        G('Dana-Farber Cancer Institute — Adult Leukemia Program', 'Boston, Massachusetts', 'Care and clinical trials for AML, ALL and CML.', 'https://www.dana-farber.org/cancer-care/treatment/hematologic-oncology/programs/leukemia', 'Dana-Farber')
      ] },
    { code: 'CA', name: 'Canada', flag: '🇨🇦', region: 'Americas',
      stats: S(8135, 3246, 10.80, 3.06),
      registry: L('Health Canada Clinical Trials Database', 'https://clinical-trials-search.canada.ca/en/home'), regulator: L('Health Canada', 'https://www.canada.ca/en/health-canada.html'),
      guideline: L('Alberta Health Services cancer guidelines', 'https://www.albertahealthservices.ca/info/cancerguidelines.aspx'), patientOrg: L('Leukemia & Lymphoma Society of Canada', 'https://www.bloodcancers.ca/'),
      groups: [
        G('Princess Margaret Cancer Centre — Leukemia Program', 'Toronto, Ontario', 'Describes itself as the largest leukemia center in Canada; nearly half of Ontario\'s leukemia patients are assessed there.', 'https://www.uhn.ca/PrincessMargaret/Clinics/Leukemia', 'Princess Margaret'),
        G('Canadian Cancer Trials Group', 'Queen\'s University, Kingston', 'National cooperative group; its hematologic disease committee runs AML and CLL trials.', 'https://www.ctg.queensu.ca/', 'CCTG'),
        G('C17 Council', 'Multi-center', 'Council of Canada\'s pediatric hematology, oncology and transplant programs; funds research and widens access to early-phase trials for children.', 'https://www.c17.ca/', 'C17')
      ] },
    { code: 'MX', name: 'Mexico', flag: '🇲🇽', region: 'Americas', aff: ['Mexico', 'México'],
      stats: S(8014, 4599, 6.32, 3.27),
      registry: L('RNEC — Registro Nacional de Ensayos Clínicos (COFEPRIS)', 'https://www.gob.mx/cofepris/acciones-y-programas/ensayos-clinicos-protocolos-de-investigacion-en-seres-humanos-397098'), regulator: L('COFEPRIS', 'https://www.gob.mx/cofepris'),
      groups: [
        G('Instituto Nacional de Cancerología', 'Mexico City', 'National cancer institute; its hematology service treats adults with acute leukemia.', 'https://incan.salud.gob.mx/', 'INCan'),
        G('Hospital Infantil de México Federico Gómez', 'Mexico City', 'National pediatric referral hospital with published research on childhood ALL.', 'https://www.himfg.edu.mx/', 'HIMFG'),
        G('Grupo de Trabajo de Leucemia Aguda (AMEH)', 'Multi-center', 'Acute leukemia working group of the Mexican hematology association; runs multi-center adult ALL and AML registries.', null, 'GTLA')
      ] },
    { code: 'BR', name: 'Brazil', flag: '🇧🇷', region: 'Americas', aff: ['Brazil', 'Brasil'],
      stats: S(12899, 8866, 4.98, 3.14),
      registry: L('ReBEC — Registro Brasileiro de Ensaios Clínicos', 'https://ensaiosclinicos.gov.br/'), regulator: L('ANVISA', 'https://www.gov.br/anvisa/pt-br'),
      guideline: L('ABHH — Associação Brasileira de Hematologia, Hemoterapia e Terapia Celular', 'https://abhh.org.br/'), patientOrg: L('ABRALE — Associação Brasileira de Linfoma e Leucemia', 'https://abrale.org.br/'),
      groups: [
        G('Ribeirão Preto Medical School, University of São Paulo', 'Ribeirão Preto', 'Brazilian coordinating center of the International Consortium on Acute Promyelocytic Leukemia (IC-APL), which roughly halved early deaths from APL across participating countries.', 'https://www.fmrp.usp.br/', 'USP Ribeirão Preto / IC-APL'),
        G('Centro Infantil Boldrini', 'Campinas', 'Has coordinated the GBTLI national childhood ALL protocols since 1980.', 'https://www.boldrini.org.br/', 'Boldrini / GBTLI'),
        G('Instituto Nacional de Câncer', 'Rio de Janeiro', 'Brazil\'s national cancer institute.', 'https://www.gov.br/inca/pt-br', 'INCA')
      ] },
    { code: 'AR', name: 'Argentina', flag: '🇦🇷', region: 'Americas',
      stats: S(3303, 2134, 6.11, 3.27),
      registry: L('ReNIS — Registro Nacional de Investigaciones en Salud', 'https://www.argentina.gob.ar/salud/epidemiologia/registro-nacional-de-investigaciones-en-salud-renis'), regulator: L('ANMAT', 'https://www.argentina.gob.ar/anmat'),
      guideline: L('Sociedad Argentina de Hematología', 'https://www.sah.org.ar/'), patientOrg: L('Asociación ALMA', 'https://asociacionalma.org.ar/'),
      groups: [
        G('GATLA — Grupo Argentino de Tratamiento de la Leucemia Aguda', 'Buenos Aires', 'Cooperative group running adult and pediatric leukemia protocols for more than 50 years, including the international ALLIC-BFM childhood ALL protocol.', 'https://gatla.com.ar/', 'GATLA'),
        G('FUNDALEU — Fundación para Combatir la Leucemia', 'Buenos Aires', 'Hematology center with active research protocols; collaborates with PETHEMA and the European LeukemiaNet.', 'https://fundaleu.org/', 'FUNDALEU')
      ] },

    // ---------------- Europe ----------------
    { code: 'GB', name: 'United Kingdom', flag: '🇬🇧', region: 'Europe', aff: ['United Kingdom', 'UK'],
      stats: S(10525, 5264, 7.95, 2.77),
      registry: L('ISRCTN registry', 'https://www.isrctn.com/'), regulator: L('MHRA', 'https://www.gov.uk/government/organisations/medicines-and-healthcare-products-regulatory-agency'),
      guideline: L('NICE — blood and bone marrow cancers', 'https://www.nice.org.uk/guidance/conditions-and-diseases/blood-and-immune-system-conditions/blood-and-bone-marrow-cancers'), patientOrg: L('Blood Cancer UK', 'https://bloodcancer.org.uk/'),
      groups: [
        G('Centre for Trials Research, Cardiff University', 'Cardiff', 'Coordinates the UK national AML trial series (AML15 through AML19).', 'https://www.cardiff.ac.uk/centre-for-trials-research', 'Cardiff CTR'),
        G('Cancer Research UK & UCL Cancer Trials Centre', 'London', 'Coordinated the national adult ALL trials UKALL14 and UKALL60+.', 'https://www.ctc.ucl.ac.uk/', 'CRUK & UCL CTC'),
        G('British Society for Haematology', 'London', 'Publishes UK haematology guidelines, including leukemia.', 'https://b-s-h.org.uk/guidelines', 'BSH')
      ] },
    { code: 'FR', name: 'France', flag: '🇫🇷', region: 'Europe',
      stats: S(13328, 6844, 9.59, 3.17),
      registry: CTIS, regulator: L('ANSM', 'https://ansm.sante.fr/'),
      guideline: L('Institut National du Cancer (INCa)', 'https://www.cancer.fr/'), patientOrg: L('Association Laurette Fugain', 'https://www.laurettefugain.org/'),
      groups: [
        G('ALFA — Acute Leukemia French Association', 'Multi-center', 'Founded in 1998; runs adult AML trials across 33 centers.', 'https://www.alfa-leukemia.org/', 'ALFA'),
        G('FILO — French Innovative Leukemia Organization', 'Tours', 'Cooperative group for CLL and AML trials.', 'https://www.filo-leucemie.org/', 'FILO'),
        G('GRAALL — Group for Research on Adult Acute Lymphoblastic Leukemia', 'France, Belgium, Switzerland', 'Intergroup created in 2003 for adult ALL trials.', null, 'GRAALL'),
        G('Fi-LMC — France Intergroupe des Leucémies Myéloïdes Chroniques', 'Bordeaux', 'CML research and education group founded in 2000.', 'https://lmc-cml.org/', 'Fi-LMC')
      ] },
    { code: 'DE', name: 'Germany', flag: '🇩🇪', region: 'Europe', aff: ['Germany', 'Deutschland'],
      stats: S(16011, 9528, 7.16, 3.38),
      registry: L('DRKS — German Clinical Trials Register', 'https://drks.de/search/en'), regulator: L('BfArM', 'https://www.bfarm.de/'),
      guideline: L('Onkopedia (DGHO)', 'https://www.onkopedia.com/'), patientOrg: L('Deutsche Leukämie- & Lymphom-Hilfe', 'https://www.leukaemie-hilfe.de/'),
      groups: [
        G('German CLL Study Group', 'Cologne', 'Founded in 1996; runs phase 1–3 CLL trials and a national registry.', 'https://www.dcllsg.com/', 'DCLLSG'),
        G('GMALL — German Multicenter Study Group for Adult ALL', 'Frankfurt', 'Over 40 years of adult ALL treatment trials across about 150 German and Austrian hospitals.', 'https://www.uct-frankfurt.de/gmall/', 'GMALL'),
        G('SAL and AMLCG — AML study groups', 'Dresden and Munich', 'Study Alliance Leukemia and the AML Cooperative Group run AML trials, AML and APL registries and a biobank.', 'https://www.aml-germany.com/', 'SAL / AMLCG'),
        G('German CML Study Group', 'Mannheim', 'Founded in 1982; ran the randomized CML Study IV.', 'https://www.umm.de/iii-medizinische-klinik/forschung-lehre/netzwerke-forschungseinrichtungen/deutsche-cml-studiengruppe/', 'CML Study Group')
      ] },
    { code: 'IT', name: 'Italy', flag: '🇮🇹', region: 'Europe', aff: ['Italy', 'Italia'],
      stats: S(9809, 6811, 7.62, 3.32),
      registry: CTIS, regulator: L('AIFA', 'https://www.aifa.gov.it/'),
      guideline: L('Società Italiana di Ematologia', 'https://www.siematologia.it/'), patientOrg: L('AIL — Associazione Italiana contro Leucemie, Linfomi e Mieloma', 'https://www.ail.it/'),
      groups: [
        G('GIMEMA Foundation', 'Rome', 'National adult hematology group; led the APL0406 trial establishing chemotherapy-free ATRA plus arsenic trioxide for APL.', 'https://www.gimema.it/', 'GIMEMA'),
        G('University of Perugia', 'Perugia', 'Where NPM1 mutations in AML were discovered and T-cell-depleted haploidentical transplantation was developed.', 'https://www.unipg.it/', 'Perugia'),
        G('AIEOP', 'Multi-center', 'Italian association of pediatric hematology and oncology.', 'https://www.aieop.org/', 'AIEOP')
      ] },
    { code: 'ES', name: 'Spain', flag: '🇪🇸', region: 'Europe', aff: ['Spain', 'España'],
      stats: S(5701, 3451, 6.20, 2.52),
      registry: L('REec — Registro Español de Estudios Clínicos', 'https://reec.aemps.es/'), regulator: L('AEMPS', 'https://www.aemps.gob.es/'),
      guideline: L('Sociedad Española de Hematología y Hemoterapia', 'https://www.sehh.es/'), patientOrg: L('Fundación Josep Carreras contra la Leucemia', 'https://www.fcarreras.org/'),
      groups: [
        G('PETHEMA', 'Multi-center', 'Spanish cooperative group for hematologic cancers; known for risk-adapted ATRA plus anthracycline protocols in APL.', 'https://www.fundacionpethema.es/', 'PETHEMA'),
        G('Josep Carreras Leukaemia Research Institute', 'Badalona', 'Research center dedicated to leukemia and other blood cancers, founded in 2010.', 'https://www.carrerasresearch.org/', 'Josep Carreras Institute')
      ] },
    { code: 'NL', name: 'Netherlands', flag: '🇳🇱', region: 'Europe',
      stats: S(2901, 1648, 8.73, 3.13),
      registry: L('OMON — Overview of Medical Research in the Netherlands', 'https://onderzoekmetmensen.nl/'), regulator: L('CBG-MEB', 'https://english.cbg-meb.nl/'),
      guideline: L('HOVON treatment guidelines', 'https://hovon.nl/en/treatment-guidelines'), patientOrg: L('Hematon', 'https://www.hematon.nl/'),
      groups: [
        G('HOVON', 'Multi-center', 'Dutch-Belgian cooperative trial group for adult hemato-oncology.', 'https://hovon.nl/', 'HOVON'),
        G('Erasmus MC', 'Rotterdam', 'Known for gene-expression profiling studies that refined AML classification.', 'https://www.erasmusmc.nl/', 'Erasmus MC'),
        G('Princess Máxima Center', 'Utrecht', 'National center for pediatric oncology.', 'https://www.prinsesmaximacentrum.nl/en', 'Princess Máxima')
      ] },
    { code: 'RU', name: 'Russia', flag: '🇷🇺', region: 'Europe', aff: ['Russia', 'Russian Federation'],
      stats: S(13555, 8083, 6.49, 3.12),
      registry: L('GRLS — clinical trial permits register', 'https://grls.rosminzdrav.ru/CIPermitionReg.aspx'), regulator: L('Roszdravnadzor', 'https://roszdravnadzor.gov.ru/'),
      guideline: L('Ministry of Health clinical recommendations', 'https://cr.minzdrav.gov.ru/'), patientOrg: L('Sodeystvie oncohematology society', 'https://sodeystvie-cml.ru/'),
      groups: [
        G('National Medical Research Center for Hematology', 'Moscow', 'Coordinates the RALL multi-center trials in adult ALL.', 'https://blood.ru/', 'NMRC Hematology'),
        G('Dmitry Rogachev National Medical Research Center', 'Moscow', 'Coordinates the ALL-MB (Moscow–Berlin) childhood ALL protocols.', 'https://fnkc.ru/', 'Rogachev Center'),
        G('Raisa Gorbacheva Institute, First Pavlov State Medical University', 'St Petersburg', 'Stem cell transplantation center for children and adults.', 'https://www.1spbgmu.ru/', 'Gorbacheva Institute')
      ] },

    // ---------------- Asia-Pacific ----------------
    { code: 'CN', name: 'China', flag: '🇨🇳', region: 'Asia-Pacific',
      stats: S(86478, 50779, 4.67, 2.28),
      registry: L('ChiCTR — Chinese Clinical Trial Registry', 'https://www.chictr.org.cn/'), regulator: L('National Medical Products Administration (NMPA)', 'https://english.nmpa.gov.cn/'),
      guideline: L('Chinese Society of Clinical Oncology (CSCO)', 'https://www.csco.org.cn/'), patientOrg: L('New Sunshine Charity Foundation', 'https://en.isun.org.cn/'),
      groups: [
        G('Shanghai Institute of Hematology, Ruijin Hospital', 'Shanghai', 'Where all-trans retinoic acid differentiation therapy, and its combination with arsenic trioxide, was developed for APL.', null, 'Ruijin Hospital'),
        G('Peking University Institute of Hematology, People\'s Hospital', 'Beijing', 'Developed the "Beijing Protocol" for haploidentical (half-matched) stem cell transplantation.', 'https://english.pkuph.cn/', 'Peking University'),
        G('Institute of Hematology & Blood Diseases Hospital, CAMS & PUMC', 'Tianjin', 'National hematology specialty hospital and research institute, founded in 1957.', 'https://www.chinablood.com.cn/', 'CAMS Tianjin'),
        G('Chinese Children\'s Cancer Group', 'Multi-center', 'Its CCCG-ALL-2015 study treated 7,640 children with ALL in 20 hospitals.', null, 'CCCG'),
        G('First Affiliated Hospital, Harbin Medical University', 'Harbin', 'Origin of arsenic trioxide therapy for leukemia in the 1970s.', 'https://www.hrbmu.edu.cn/', 'Harbin')
      ] },
    { code: 'IN', name: 'India', flag: '🇮🇳', region: 'Asia-Pacific',
      stats: S(49542, 32731, 3.48, 2.30),
      registry: L('CTRI — Clinical Trials Registry-India', 'https://ctri.nic.in/'), regulator: L('CDSCO', 'https://cdsco.gov.in/'),
      guideline: L('National Cancer Grid guidelines', 'https://www.ncgindia.org/cancer-guidelines'), patientOrg: L('Friends of Max (CML support)', 'https://friendsofmax.info/'),
      groups: [
        G('Tata Memorial Centre / ACTREC', 'Mumbai', 'Hub of India\'s National Cancer Grid; ran the clinical trials of NexCAR19, India\'s first home-grown CD19 CAR T-cell therapy.', 'https://tmc.gov.in/', 'Tata Memorial'),
        G('Christian Medical College', 'Vellore', 'Known for single-agent arsenic trioxide treatment of newly diagnosed APL.', 'https://www.cmch-vellore.edu/', 'CMC Vellore'),
        G('Indian Collaborative Childhood Leukaemia group', 'Multi-center', 'Runs ICiCLe-ALL-14, described as the first multi-center randomized childhood cancer trial in India.', null, 'ICiCLe')
      ] },
    { code: 'JP', name: 'Japan', flag: '🇯🇵', region: 'Asia-Pacific',
      stats: S(14998, 10498, 6.54, 2.31),
      registry: L('jRCT — Japan Registry of Clinical Trials', 'https://jrct.mhlw.go.jp/'), regulator: L('PMDA', 'https://www.pmda.go.jp/english/'),
      guideline: L('Japanese Society of Hematology', 'https://www.jshem.or.jp/en/'), patientOrg: L('NPO Tsubasa', 'https://tsubasa-npo.org/'),
      groups: [
        G('Japan Adult Leukemia Study Group', 'Multi-center', 'Founded in 1987; runs the national series of adult AML and APL trials.', 'https://www.jalsg.jp/', 'JALSG'),
        G('Japan Children\'s Cancer Group', 'Multi-center', 'Runs national pediatric ALL and AML trials (incorporating the former JPLSG).', 'https://jccg.jp/', 'JCCG'),
        G('Japan Clinical Oncology Group — Lymphoma Study Group', 'Tokyo', 'Runs trials in adult T-cell leukemia-lymphoma, a disease concentrated in southwestern Japan.', 'https://jcog.jp/en/', 'JCOG')
      ] },
    { code: 'KR', name: 'South Korea', flag: '🇰🇷', region: 'Asia-Pacific', aff: ['Korea'],
      stats: S(4159, 2335, 5.79, 2.17),
      registry: L('CRIS — Clinical Research Information Service', 'https://cris.nih.go.kr/'), regulator: L('Ministry of Food and Drug Safety (MFDS)', 'https://www.mfds.go.kr/eng/'),
      guideline: L('Korean Society of Hematology', 'https://www.hematology.or.kr/'), patientOrg: L('Korea Leukemia Patients Organization', 'https://www.leukemia.kr/'),
      groups: [
        G('Catholic Hematology Hospital, Seoul St. Mary\'s Hospital', 'Seoul', 'Performed Korea\'s first stem cell transplant in 1983 and passed 10,000 transplants in 2024.', 'https://www.hematology.kr/eng/main.do', 'Seoul St. Mary\'s'),
        G('Korean Society of Hematology — AML/MDS Working Party', 'Multi-center', 'Runs the nationwide Korean AML Registry.', 'https://www.hematology.or.kr/', 'KSH')
      ] },
    { code: 'TH', name: 'Thailand', flag: '🇹🇭', region: 'Asia-Pacific',
      stats: S(4257, 2954, 4.77, 3.08),
      registry: L('TCTR — Thai Clinical Trials Registry', 'https://www.thaiclinicaltrials.org/'), regulator: L('Thai Food and Drug Administration', 'https://en.fda.moph.go.th/'),
      guideline: L('Thai Society of Hematology', 'https://www.tsh.or.th/'), patientOrg: L('Thai CML Patient Group', 'https://www.thaicml.com/'),
      groups: [
        G('Thai Acute Leukemia Working Group', 'Multi-center', 'Under the Thai Society of Hematology; runs a prospective AML registry across nine academic hospitals.', 'https://www.tsh.or.th/', 'Thai Acute Leukemia WG'),
        G('Thai Pediatric Oncology Group', 'Multi-center', 'Develops the national childhood ALL protocols.', null, 'ThaiPOG'),
        G('Siriraj Hospital, Mahidol University', 'Bangkok', 'Division of Hematology with published acute leukemia and transplant research.', 'https://www2.si.mahidol.ac.th/en/', 'Siriraj')
      ] },
    { code: 'AU', name: 'Australia', flag: '🇦🇺', region: 'Asia-Pacific',
      stats: S(5490, 2238, 11.35, 3.22),
      registry: L('ANZCTR — Australian New Zealand Clinical Trials Registry', 'https://www.anzctr.org.au/'), regulator: L('Therapeutic Goods Administration (TGA)', 'https://www.tga.gov.au/'),
      guideline: L('eviQ', 'https://www.eviq.org.au/'), patientOrg: L('Leukaemia Foundation', 'https://www.leukaemia.org.au/'),
      groups: [
        G('Australasian Leukaemia & Lymphoma Group', 'Melbourne', 'Not-for-profit collaborative blood cancer trial group for Australia and New Zealand, active since 1973.', 'https://allg.org.au/', 'ALLG'),
        G('WEHI, Royal Melbourne Hospital and Peter MacCallum Cancer Centre', 'Melbourne', 'BCL-2 research at WEHI led to venetoclax; the first-in-human trials ran in Melbourne in 2011.', 'https://www.wehi.edu.au/', 'WEHI / Peter Mac'),
        G('SAHMRI', 'Adelaide', 'CML research program, including work on treatment-free remission.', 'https://sahmri.org.au/', 'SAHMRI'),
        G('ANZCHOG', 'Multi-center', 'Children\'s cancer trials group for Australia and New Zealand.', 'https://anzchog.org/', 'ANZCHOG')
      ] },

    // ---------------- Middle East & Africa ----------------
    { code: 'TR', name: 'Türkiye', flag: '🇹🇷', region: 'Middle East & Africa', aff: ['Turkey', 'Türkiye'],
      stats: S(6546, 3954, 6.64, 3.54),
      registry: L('TİTCK Clinical Trials Portal', 'https://kap.titck.gov.tr/'), regulator: L('TİTCK — Turkish Medicines and Medical Devices Agency', 'https://www.titck.gov.tr/'),
      guideline: L('Turkish Society of Hematology', 'https://www.thd.org.tr/'),
      groups: [
        G('Turkish Society of Hematology', 'Ankara', 'Its Acute Leukemia Working Group runs the national AML registry; publishes national guidelines.', 'https://www.thd.org.tr/', 'THD')
      ] },
    { code: 'IR', name: 'Iran', flag: '🇮🇷', region: 'Middle East & Africa',
      stats: S(7009, 4879, 7.31, 5.02),
      registry: L('IRCT — Iranian Registry of Clinical Trials', 'https://irct.ir/'), patientOrg: L('MAHAK (childhood cancer)', 'https://mahak-charity.org/'),
      groups: [
        G('Hematology-Oncology & Stem Cell Transplantation Research Center, Shariati Hospital', 'Tehran', 'Tehran University of Medical Sciences center; performed Iran\'s first stem cell transplant in 1991 and studied single-agent arsenic trioxide as first-line APL treatment.', null, 'Shariati Hospital'),
        G('Hematology Research Center, Namazi Hospital', 'Shiraz', 'Shiraz University of Medical Sciences; long-running transplant program for thalassemia and leukemia.', null, 'Shiraz')
      ] },
    { code: 'SA', name: 'Saudi Arabia', flag: '🇸🇦', region: 'Middle East & Africa',
      stats: S(1098, 645, 3.86, 2.39),
      registry: L('Saudi Clinical Trials Registry (SFDA)', 'https://sctr.sfda.gov.sa/'), regulator: L('Saudi Food and Drug Authority (SFDA)', 'https://www.sfda.gov.sa/'),
      patientOrg: L('Sanad Children\'s Cancer Support Association', 'https://sanad.org.sa/'),
      groups: [
        G('King Faisal Specialist Hospital & Research Centre', 'Riyadh', 'Adult program with over 5,100 stem cell transplants, plus a large pediatric transplant program.', 'https://www.kfshrc.edu.sa/', 'KFSHRC'),
        G('Saudi Society of Blood & Marrow Transplantation', 'Multi-center', 'Publishes national transplant activity reports and a Saudi AML consensus guideline.', 'https://www.ssbmt.org/', 'SSBMT')
      ] },
    { code: 'IL', name: 'Israel', flag: '🇮🇱', region: 'Middle East & Africa',
      stats: S(845, 507, 6.54, 3.01),
      registry: L('MyTrial — Ministry of Health registry', 'https://my.health.gov.il/CliniTrials/Pages/Home.aspx'),
      guideline: L('Israel Society of Hematology and Transfusion Medicine', 'https://www.hematology.org.il/'), patientOrg: L('Halil HaOr — leukemia and lymphoma patients', 'https://halil.org.il/'),
      groups: [
        G('Israeli Acute Leukemia Working Group', 'Multi-center', 'Runs prospective multi-center AML studies across 12 Israeli hospitals.', null, 'Israeli AL Working Group'),
        G('Weizmann Institute of Science', 'Rehovot', 'Early molecular characterization of the BCR-ABL fusion in CML.', 'https://www.weizmann.ac.il/', 'Weizmann')
      ] },
    { code: 'EG', name: 'Egypt', flag: '🇪🇬', region: 'Middle East & Africa',
      stats: S(5195, 3141, 4.90, 3.03),
      registry: PACTR, regulator: L('Egyptian Drug Authority', 'https://www.edaegypt.gov.eg/'),
      groups: [
        G('National Cancer Institute, Cairo University', 'Cairo', 'Egypt\'s main academic cancer center, with published leukemia outcome studies.', 'https://nci.cu.edu.eg/', 'NCI Cairo'),
        G('Children\'s Cancer Hospital Egypt 57357', 'Cairo', 'Large pediatric cancer hospital treating childhood ALL on protocols adapted from St. Jude.', 'https://www.57357.org/', 'CCHE 57357')
      ] },
    { code: 'NG', name: 'Nigeria', flag: '🇳🇬', region: 'Middle East & Africa',
      stats: S(1987, 1436, 1.33, 1.01),
      registry: PACTR, regulator: L('NAFDAC', 'https://nafdac.gov.ng/'),
      guideline: L('Nigerian Society for Haematology and Blood Transfusion', 'https://nshbt.org.ng/'),
      groups: [
        G('Obafemi Awolowo University Teaching Hospitals Complex', 'Ile-Ife', 'National center providing free imatinib for CML through an international access program since 2003.', 'https://oauthc.com/', 'OAUTHC Ile-Ife'),
        G('University College Hospital', 'Ibadan', 'Teaching hospital with published acute leukemia case series.', 'https://uch-ibadan.org.ng/', 'UCH Ibadan')
      ] },
    { code: 'ZA', name: 'South Africa', flag: '🇿🇦', region: 'Middle East & Africa',
      stats: S(1854, 1274, 2.93, 2.01),
      registry: L('SANCTR — South African National Clinical Trials Register', 'https://sanctr.samrc.ac.za/'), regulator: L('SAHPRA', 'https://www.sahpra.org.za/'),
      guideline: L('South African Society of Haematology', 'https://www.sash.org.za/'), patientOrg: L('DKMS Africa', 'https://www.dkms-africa.org/'),
      groups: [
        G('Groote Schuur Hospital / University of Cape Town', 'Cape Town', 'Bone marrow transplant program running since the 1970s.', 'https://www.uct.ac.za/', 'UCT / Groote Schuur'),
        G('Chris Hani Baragwanath Hospital / University of the Witwatersrand', 'Johannesburg', 'Clinical hematology unit with large published series of blood cancer patients.', 'https://www.wits.ac.za/pathology/divisions/molecular-medicine--haematology/', 'Wits')
      ] }
  ];
})();
