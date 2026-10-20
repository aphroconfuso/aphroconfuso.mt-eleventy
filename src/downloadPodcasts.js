const podcastsArray = [
  [
    'Marta Marta (silta)',
    'https://assets.pippa.io/shows/63ef6b4c3642ca00119bcf72/1791997514725-aeada3f5-e97d-4ae9-a36a-a3bc43ae0d20.mp3'
  ],
  [
    'Ommi Saret id-Dawl Fiddien',
    'https://assets.pippa.io/shows/63ef6b4c3642ca00119bcf72/1792008349947-10920122-26c5-44c2-b125-8ffafb254d94.mp3'
  ],
  [
    '“siġra tal-lewż”',
    'https://assets.pippa.io/shows/63ef6b4c3642ca00119bcf72/1788546031743-876aa7c3-afd8-438d-b84a-704a1ab10ba0.mp3'
  ],
  [
    'Pollakki ta’ Chełmno',
    'https://assets.pippa.io/shows/63ef6b4c3642ca00119bcf72/1789290594037-365db32c-ad51-4942-bbb6-427e0db82dd1.mp3'
  ],
  [
    'Travi taċ-Ċedru Saqaf taċ-Ċipress',
    'https://assets.pippa.io/shows/63ef6b4c3642ca00119bcf72/1775318304615-c2f757e7-8acd-4c73-a5f5-724ba8fea696.mp3'
  ],
  [
    'Siġra bil-Frott',
    'https://assets.pippa.io/shows/63ef6b4c3642ca00119bcf72/1785428039419-10ef3493-0e4d-4c5c-a128-0e06f2b605ae.mp3'
  ],
  [
    'Distanzi Twal',
    'https://assets.pippa.io/shows/63ef6b4c3642ca00119bcf72/1784641514215-165a4a4e-d9f6-4a72-ab91-6c23095353aa.mp3'
  ],
  [
    'Sal-Għasfur Isib Fejn Jgħammar',
    'https://assets.pippa.io/shows/63ef6b4c3642ca00119bcf72/1791996166713-6a482979-3623-4647-9f91-04e142e41505.mp3'
  ],
  [
    'Jisimni Gianna',
    'https://assets.pippa.io/shows/63ef6b4c3642ca00119bcf72/1781283720967-44e28848-5dec-4733-a6f3-3b7e4f6b3f80.mp3'
  ],
  [
    'Fejn Ħallejtha r-Rota Meta Ħrabt? #7',
    'https://assets.pippa.io/shows/63ef6b4c3642ca00119bcf72/1787563289381-bcfaef25-c26f-4d1e-ab8c-643aab6faa74.mp3'
  ],
  [
    'Fejn Ħallejtha r-Rota Meta Ħrabt? #6',
    'https://assets.pippa.io/shows/63ef6b4c3642ca00119bcf72/1787524664750-403f61a3-5bd0-4514-969a-398da26459ab.mp3'
  ],
  [
    'Fejn Ħallejtha r-Rota Meta Ħrabt? #5',
    'https://assets.pippa.io/shows/63ef6b4c3642ca00119bcf72/1787524469486-070065b2-c6fe-4932-a25b-d641bb5c1cce.mp3'
  ],
  [
    'Fejn Ħallejtha r-Rota Meta Ħrabt? #4',
    'https://assets.pippa.io/shows/63ef6b4c3642ca00119bcf72/1787524236603-1f19f656-fa11-4c8b-b4f5-bebecc886fc0.mp3'
  ],
  [
    'Fejn Ħallejtha r-Rota Meta Ħrabt? #3',
    'https://assets.pippa.io/shows/63ef6b4c3642ca00119bcf72/1787524025271-6167963e-0ba8-4ffc-9a12-590df3823a26.mp3'
  ],
  [
    'Fejn Ħallejtha r-Rota Meta Ħrabt? #2',
    'https://assets.pippa.io/shows/63ef6b4c3642ca00119bcf72/1787523741273-2aaf5f15-41b2-4b08-b7f7-263e9cdd36e0.mp3'
  ],
  [
    'Fejn Ħallejtha r-Rota Meta Ħrabt? #1',
    'https://assets.pippa.io/shows/63ef6b4c3642ca00119bcf72/1787563124107-cf5ddb16-c31d-4b5a-9fa8-5783102fff05.mp3'
  ],
  [
    'Fejn Ħallejtha r-Rota Meta Ħrabt?',
    'https://assets.pippa.io/shows/63ef6b4c3642ca00119bcf72/1787523362463-3b101b7f-3736-4e0f-8cba-81280d6010a0.mp3'
  ],
  [
    'Invokazzjonijiet #5',
    'https://s3.amazonaws.com/assets.pippa.io/shows/63ef6b4c3642ca00119bcf72/1751013329407-d8e0577d-b3e4-4272-a7db-0e727a1e15fa.mp3'
  ],
  [
    'Invokazzjonijiet #4',
    'https://s3.amazonaws.com/assets.pippa.io/shows/63ef6b4c3642ca00119bcf72/1751013047838-025477d9-54a9-4b8d-8851-6f1162a71e47.mp3'
  ],
  [
    'Invokazzjonijiet #3',
    'https://s3.amazonaws.com/assets.pippa.io/shows/63ef6b4c3642ca00119bcf72/1751012360315-fac93f10-6538-42b3-8851-997510195308.mp3'
  ],
  [
    'Qarn (soundscape)',
    'https://s3.amazonaws.com/assets.pippa.io/shows/63ef6b4c3642ca00119bcf72/1749237218300-af24b426-053a-4a47-806d-0dc611d0cf77.mp3'
  ],
  [
    'persefoni tmur tixtri l-ħwejjeġ secondhand',
    'https://s3.amazonaws.com/assets.pippa.io/shows/63ef6b4c3642ca00119bcf72/1764659550990-6cf7074b-acee-4652-9b8d-360e5e75aa7b.mp3'
  ],
  [
    'L-Għoxx Mera tar-Ruħ',
    'https://s3.amazonaws.com/assets.pippa.io/shows/63ef6b4c3642ca00119bcf72/1756336283694-0b995015-14e2-4f9e-9660-b5873f4463a8.mp3'
  ],
  [
    'Invokazzjonijiet #2',
    'https://s3.amazonaws.com/assets.pippa.io/shows/63ef6b4c3642ca00119bcf72/1751011778190-f419f810-f0ac-4181-954d-c53862d231f7.mp3'
  ],
  [
    'Invokazzjonijiet #1',
    'https://s3.amazonaws.com/assets.pippa.io/shows/63ef6b4c3642ca00119bcf72/1751010071029-7deed79c-8aeb-4c97-9539-f7c4bd616e0d.mp3'
  ],
  [
    'Kullana ta’ Għanjiet Dwar il-Ħolm #8',
    'https://s3.amazonaws.com/assets.pippa.io/shows/63ef6b4c3642ca00119bcf72/1739098482642-7fc547b4-ee2b-4a85-92a5-758fbdc0eed2.mp3'
  ],
  [
    'Kullana ta’ Għanjiet Dwar il-Ħolm #9',
    'https://s3.amazonaws.com/assets.pippa.io/shows/63ef6b4c3642ca00119bcf72/1739096154059-651e4904-8ef4-452e-86b3-097be28fb2d6.mp3'
  ],
  [
    'Kullana ta’ Għanjiet Dwar il-Ħolm #7',
    'https://s3.amazonaws.com/assets.pippa.io/shows/63ef6b4c3642ca00119bcf72/1738964586511-21586515-e60f-44a7-a80f-9fd937c5271f.mp3'
  ],
  [
    'Aċtu fl-Istonku',
    'https://s3.amazonaws.com/assets.pippa.io/shows/63ef6b4c3642ca00119bcf72/1741515124163-1cf81841-071c-4791-89de-6708d69e953e.mp3'
  ],
  [
    'Għalhekk Qed Nivvjaġġa bil-Mod #1',
    'https://s3.amazonaws.com/assets.pippa.io/shows/63ef6b4c3642ca00119bcf72/1758176664620-6a0d204e-fd97-4582-a1c2-8bf3245321b9.mp3'
  ],
  [
    'Kullana ta’ Għanjiet Dwar il-Ħolm #6',
    'https://s3.amazonaws.com/assets.pippa.io/shows/63ef6b4c3642ca00119bcf72/1738344213524-33fd5147-1b39-4546-b449-383b438c3244.mp3'
  ],
  [
    'Kullana ta’ Għanjiet Dwar il-Ħolm #5',
    'https://s3.amazonaws.com/assets.pippa.io/shows/63ef6b4c3642ca00119bcf72/1737674827276-5837ed95-ebc9-454b-a819-e94541b7b9c4.mp3'
  ],
  [
    'Kullana ta’ Għanjiet Dwar il-Ħolm #4',
    'https://s3.amazonaws.com/assets.pippa.io/shows/63ef6b4c3642ca00119bcf72/1737671527251-9111102c-372f-44ce-8764-0da57bde09fd.mp3'
  ],
  [
    'Kullana ta’ Għanjiet Dwar il-Ħolm #3',
    'https://s3.amazonaws.com/assets.pippa.io/shows/63ef6b4c3642ca00119bcf72/1737110143521-03555a14-3cb6-41bd-998a-cfc39ab86ab1.mp3'
  ],
  [
    'Kullana ta’ Għanjiet Dwar il-Ħolm #2',
    'https://s3.amazonaws.com/assets.pippa.io/shows/63ef6b4c3642ca00119bcf72/1736430929469-636ad005-9374-4709-be48-d8d913698311.mp3'
  ],
  [
    'Kullana ta’ Għanjiet Dwar il-Ħolm #1',
    'https://s3.amazonaws.com/assets.pippa.io/shows/63ef6b4c3642ca00119bcf72/1736429623306-c186ada1-61fd-48c9-98dd-52019d87bc14.mp3'
  ],
  [
    'il-ġentrifikazzjoni tas-skiet',
    'https://s3.amazonaws.com/assets.pippa.io/shows/63ef6b4c3642ca00119bcf72/1739099369917-9677e0c6-c222-451d-b35c-612b6bbe6d4e.mp3'
  ],
  [
    'nonfoħ fil-kustilji allużjonijiet ġodda',
    'https://s3.amazonaws.com/assets.pippa.io/shows/63ef6b4c3642ca00119bcf72/1739098953457-271a8353-effc-42e8-aef9-eacbf4cc858d.mp3'
  ],
  [
    'Dwar sens ta’ ħarifa',
    'https://s3.amazonaws.com/assets.pippa.io/shows/63ef6b4c3642ca00119bcf72/1741820860601-bb541013-611d-44d8-901d-5d995aac4b28.mp3'
  ],
  [
    'Sottomissjoni',
    'https://s3.amazonaws.com/assets.pippa.io/shows/63ef6b4c3642ca00119bcf72/1722850010384-ffa1482e-c4e6-4626-a4e4-72ea4e700360.mp3'
  ],
  [
    'Il-Kastell',
    'https://s3.amazonaws.com/assets.pippa.io/shows/63ef6b4c3642ca00119bcf72/1742992882409-d78f3b4e-80f7-4654-992c-eccf85f7978c.mp3'
  ],
  [
    'lil poeta li qalli li qed jikteb bħal wieħed vera xiħ dan l-aħħar ',
    'https://s3.amazonaws.com/assets.pippa.io/shows/63ef6b4c3642ca00119bcf72/1733757948175-389ac9c8-9482-4a42-bc3f-a3fbdcdec7ac.mp3'
  ],
  [
    'ġenealoġija ta’ bankina',
    'https://s3.amazonaws.com/assets.pippa.io/shows/63ef6b4c3642ca00119bcf72/1716316823552-a4fa3f7a18606cc66f62b2fda0724d73.mp3'
  ],
  [
    'Bur Mgħeż #5',
    'https://s3.amazonaws.com/assets.pippa.io/shows/63ef6b4c3642ca00119bcf72/1753802067764-593a3722-fab1-4808-b258-4681d1085d69.mp3'
  ],
  [
    'Persjani',
    'https://s3.amazonaws.com/assets.pippa.io/shows/63ef6b4c3642ca00119bcf72/1720137572256-503a4de757ff52db57f0398c1f862155.mp3'
  ],
  [
    'Likantropi',
    'https://s3.amazonaws.com/assets.pippa.io/shows/63ef6b4c3642ca00119bcf72/1715929533879-44328d7807cb76bfbbd203973feaf9e8.mp3'
  ],
  [
    'Il-Mara tas-Suldat',
    'https://s3.amazonaws.com/assets.pippa.io/shows/63ef6b4c3642ca00119bcf72/1723968291690-6bfe1d4f-010d-48d3-81b0-64dde9c1facb.mp3'
  ],
  [
    'Bur Mgħeż #4',
    'https://assets.pippa.io/shows/63ef6b4c3642ca00119bcf72/1711653215410-544b151a7b1112f9470280c2e00f0b9a.mp3'
  ],
  [
    'Is-Solitudni tal-Fotografu',
    'https://s3.amazonaws.com/assets.pippa.io/shows/63ef6b4c3642ca00119bcf72/1717061719941-0791cc64599a7f2d04ed1c96536d473a.mp3'
  ],
  [
    'Manifest Kontra ż-Żmien',
    'https://assets.pippa.io/shows/63ef6b4c3642ca00119bcf72/1707158680851-f52151aa21d02fd548f1be5523bba3e1.mp3'
  ],
  [
    "Joey Tilbes, it-Tabù Tinża'",
    'https://s3.amazonaws.com/assets.pippa.io/shows/63ef6b4c3642ca00119bcf72/1731529359017-d892d5b3-770c-4659-929f-2b0886d8ecf3.mp3'
  ],
  [
    'Flaming Fag',
    'https://assets.pippa.io/shows/63ef6b4c3642ca00119bcf72/1705599050876-f4c151251490014f363c7dd0c2b4ca79.mp3'
  ],
  [
    'Insalata',
    'https://assets.pippa.io/shows/63ef6b4c3642ca00119bcf72/1704536274794-a87201faa86525a3216bd304e2503d9d.mp3'
  ],
  [
    'Bur Mgħeż #3',
    'https://assets.pippa.io/shows/63ef6b4c3642ca00119bcf72/1709809707479-2f133df4b52983bb1b916541b3b9c3b8.mp3'
  ],
  [
    'Wirja',
    'https://s3.amazonaws.com/assets.pippa.io/shows/63ef6b4c3642ca00119bcf72/1742992216367-26e942a4-e962-46b5-a3be-ec984fab39ec.mp3'
  ],
  [
    'Marċ Maqbuż',
    'https://s3.amazonaws.com/assets.pippa.io/shows/63ef6b4c3642ca00119bcf72/1742992673336-3792f668-f596-4670-8eec-3afb08dd3182.mp3'
  ],
  [
    '-Na -I -Hom',
    'https://assets.pippa.io/shows/63ef6b4c3642ca00119bcf72/1702652637541-55bcadf7b32412869fd602ea514eecf2.mp3'
  ],
  [
    'Qamar Aħmar',
    'https://assets.pippa.io/shows/63ef6b4c3642ca00119bcf72/1702577593975-bc07dc80051df563a457ee1b3d7ca664.mp3'
  ],
  [
    'Bur Mgħeż #2',
    'https://assets.pippa.io/shows/63ef6b4c3642ca00119bcf72/1700685637374-dfa58262fb434a99834d83d6297feb65.mp3'
  ],
  [
    'Żerriegħa',
    'https://assets.pippa.io/shows/undefined/1697184075680-93f62322a6f77a8792c708bcdc3aa553.mp3'
  ],
  [
    'Bur Mgħeż #1',
    'https://assets.pippa.io/shows/63ef6b4c3642ca00119bcf72/1700053677078-c0d614b4af3232aa62c8676279625465.mp3'
  ],
  [
    'Bil-Moħbi fil-Beraħ',
    'https://assets.pippa.io/shows/63ef6b4c3642ca00119bcf72/1703011648302-29e67d6ef286fd847c99b7d0696d6591.mp3'
  ],
  [
    'mona lisa | karnival ieħor',
    'https://assets.pippa.io/shows/63ef6b4c3642ca00119bcf72/1699442927094-63cee80a1d585992da6180722d651fa2.mp3'
  ],
  [
    'Lejl u Nhar',
    'https://assets.pippa.io/shows/63ef6b4c3642ca00119bcf72/1694022301428-f268084cf509848751ac7a4da10a9396.mp3'
  ],
  [
    'Il-Lanza, il-Labra, il-Qoffa, l-Azzarin',
    'https://assets.pippa.io/shows/63ef6b4c3642ca00119bcf72/1692908859158-2aad55f3eafbdffa58b1bb3717067174.mp3'
  ],
  [
    'Medusa',
    'https://assets.pippa.io/shows/63ef6b4c3642ca00119bcf72/1689748197301-e4932ce82ec3a84fdb0c461838fc4525.mp3'
  ],
  [
    'Ġilda',
    'https://open.acast.com/public/streams/63ef6b4c3642ca00119bcf72/episodes/64a67b7b547a490011c17145.mp3'
  ],
  [
    'Ġismi Battikata',
    'https://assets.pippa.io/shows/63ef6b4c3642ca00119bcf72/1687263931781-80a0762d50ebd5df0a3ed7c2a143a703.mp3'
  ],
  [
    'It-Tipjip',
    'https://assets.pippa.io/shows/undefined/1695743362825-f46af5fbedd1326a28ca52d31fda7aec.mp3'
  ],
  [
    'Qarn (silta)',
    'https://assets.pippa.io/shows/63ef6b4c3642ca00119bcf72/1691652233105-adc8fec5640d37a260d5cf1b92828059.mp3'
  ],
  [
    'Reċti tal-Kbar, Parties tat-Tfal',
    'https://assets.pippa.io/shows/undefined/1694973163432-897d4f651448128072d23df98f73ddfa.mp3'
  ],
  [
    'Il-Kuxjenza fit-Truf',
    'https://assets.pippa.io/shows/63ef6b4c3642ca00119bcf72/1695885246310-bb2360f4e5b2d11a564ba5868f6d5d1c.mp3'
  ],
  [
    'Ħsieb il-Ħamiema',
    'https://assets.pippa.io/shows/63ef6b4c3642ca00119bcf72/1687669833686-cbbbe5f5ee317f3ad5ebf39b960d913d.mp3'
  ],
  [
    'Noti Editorjali #13',
    'https://assets.pippa.io/shows/63ef6b4c3642ca00119bcf72/1791834213518-a149da95-9357-45fb-ae94-aaac4e782401.mp3'
  ],
  [
    'Tnedija ta’ Bur Mgħeż',
    'https://assets.pippa.io/shows/63ef6b4c3642ca00119bcf72/1784042935569-d1ff90e3-e8b0-42b5-816c-a48e9bab703e.mp3'
  ],
  [
    'Noti Editorjali #12',
    'https://assets.pippa.io/shows/63ef6b4c3642ca00119bcf72/1781717297098-0f6f1d74-39f3-4329-b0d9-67ad15d5c66c.mp3'
  ],
  [
    'Noti Editorjali #11 #11',
    'https://assets.pippa.io/shows/63ef6b4c3642ca00119bcf72/1780783539622-a1dd3b03-1ae0-4f5d-81f2-742b65c06c28.mp3'
  ],
  [
    'Qarn (taħdita)',
    'https://assets.pippa.io/shows/63ef6b4c3642ca00119bcf72/1778961557690-3f755dd5-6e97-4440-befb-c5ee85e2f2ae.mp3'
  ],
  [
    'Tnedija ta’ Travi taċ-Ċedru Saqaf taċ-Ċipress #10',
    'https://assets.pippa.io/shows/63ef6b4c3642ca00119bcf72/1776091633568-37a3b003-7be1-46a1-a707-05a91391c551.mp3'
  ],
  [
    'Noti Editorjali #10 #10',
    'https://s3.amazonaws.com/assets.pippa.io/shows/63ef6b4c3642ca00119bcf72/1769604940564-97529133-83d9-4b0a-bde8-194a18686970.mp3'
  ],
  [
    'Noti Editorjali #9 #9',
    'https://s3.amazonaws.com/assets.pippa.io/shows/63ef6b4c3642ca00119bcf72/1769028742245-59f58dee-50c1-431c-8932-d0ddf6c25a90.mp3'
  ],
  [
    'Noti Editorjali #8 #8',
    'https://s3.amazonaws.com/assets.pippa.io/shows/63ef6b4c3642ca00119bcf72/1768292708608-6ad437c2-63b2-46b7-9c68-fa207b786ca7.mp3'
  ],
  [
    'Es Sidr (taħdita u siltiet)',
    'https://s3.amazonaws.com/assets.pippa.io/shows/63ef6b4c3642ca00119bcf72/1765628490383-30b2da65-2c80-4f84-9ab0-c0c4dd33dc17.mp3'
  ],
  [
    'Noti Editorjali #7 #7',
    'https://s3.amazonaws.com/assets.pippa.io/shows/63ef6b4c3642ca00119bcf72/1764884787257-22af48f1-e63f-4c21-9542-8a6b5815494a.mp3'
  ],
  [
    'Es Sidr',
    'https://s3.amazonaws.com/assets.pippa.io/shows/63ef6b4c3642ca00119bcf72/1761317681569-963ebc85-b45b-4a94-ab09-67374389251b.mp3'
  ],
  [
    'Noti Editorjali #6 #6',
    'https://s3.amazonaws.com/assets.pippa.io/shows/63ef6b4c3642ca00119bcf72/1745253609584-283539c8-ab80-478e-8828-2362f0e5400a.mp3'
  ],
  [
    'Ħbiberija, Ħrejjef, Komunità (taħdita)',
    'https://s3.amazonaws.com/assets.pippa.io/shows/63ef6b4c3642ca00119bcf72/1738097733589-e42d4ecd-978b-4993-acdc-4b14aef84d4b.mp3'
  ],
  [
    'Il-Komunità tal-Kitba',
    'https://s3.amazonaws.com/assets.pippa.io/shows/63ef6b4c3642ca00119bcf72/1732649372834-924b5bf8-db50-4d62-963e-153f5e0fa28f.mp3'
  ],
  [
    'Noti Editorjali #5 #5',
    'https://s3.amazonaws.com/assets.pippa.io/shows/63ef6b4c3642ca00119bcf72/1715377704245-139f8001230a0af9cfa0c1a962d3baa2.mp3'
  ],
  [
    'Il-Kliem fit-Teorija',
    'https://assets.pippa.io/shows/63ef6b4c3642ca00119bcf72/1711525935546-4fe0e59da117455f2c24c93e2adbe9c6.mp3'
  ],
  [
    'Noti Editorjali #4 #4',
    'https://assets.pippa.io/shows/63ef6b4c3642ca00119bcf72/1708597005499-705158a48d293dcbc828673956bf688c.mp3'
  ],
  [
    'Noti Editorjali #3 #3',
    'https://assets.pippa.io/shows/63ef6b4c3642ca00119bcf72/1702922943014-867b06c7fd3a89a4f5d46ffd3c4981ff.mp3'
  ],
  [
    'Noti Editorjali #2 #2',
    'https://assets.pippa.io/shows/63ef6b4c3642ca00119bcf72/1700690728517-989dcc8e0a46e248753297a44ba9a258.mp3'
  ],
  [
    'Kif Tgħidha f’Qalbek',
    'https://assets.pippa.io/shows/63ef6b4c3642ca00119bcf72/1698788645967-8d84b50062e5dfe226dcc2fe5e3bcd6a.mp3'
  ],
  [
    'Noti Editorjali #1 #1',
    'https://assets.pippa.io/shows/63ef6b4c3642ca00119bcf72/1693409176364-85a68853a9e234692c4a1c71c71c9fd6.mp3'
  ]
];



const fs = require('node:fs/promises');
const path = require('node:path');

const OUTPUT_DIR = path.join(__dirname, 'downloads');
const NUMBER_OF_FOLDERS = 3;

function slugify(str) {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'untitled';
}

function randomPrefix() {
  const alphabet = 'abcdefghijklmnopqrstuvwxyz';

  return Array.from(
    { length: 5 },
    () => alphabet[Math.floor(Math.random() * alphabet.length)]
  ).join('');
}

async function downloadFile(url) {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${url}`);
  }

  return Buffer.from(await response.arrayBuffer());
}

async function main() {
  await fs.mkdir(OUTPUT_DIR, { recursive: true });

  // Create folder-1, folder-2 and folder-3.
  const folders = [];

  for (let i = 1; i <= NUMBER_OF_FOLDERS; i++) {
    const dir = path.join(OUTPUT_DIR, `folder-${i}`);
    await fs.mkdir(dir, { recursive: true });
    folders.push(dir);
  }

  for (const [title, url] of podcastsArray) {
    const slug = slugify(title);

    try {
      // Download the MP3 only once.
      console.log(`Downloading: ${title}`);
      const audio = await downloadFile(url);

      // Save a copy in each folder with a fresh prefix.
      for (const folder of folders) {
        const filename = `${randomPrefix()}-${slug}.mp3`;
        const filepath = path.join(folder, filename);

        await fs.writeFile(filepath, audio);
        console.log(`Saved: ${filepath}`);
      }
    } catch (error) {
      console.error(`Failed: ${title} — ${error.message}`);
    }
  }

  console.log('All downloads processed.');
}

main().catch(console.error);
