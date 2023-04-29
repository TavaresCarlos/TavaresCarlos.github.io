function createPopup(feature, layer) {

  const { properties } = feature;

  const fields = Object.keys(properties)

  var linha = '';

  fields.forEach((field) => {
    linha = linha + `
      <tr>
        <td>` + field + `</td>
        <td>` + properties[field] + `</td>
      </tr>
    `;
  })

  var table = `
    <div style="height: 100px; overflow-y: scroll;">
    <table class="table-marker-info">
      ` + linha + `
    </table>
    </div>
  `;

  // Retorna a tabela pronta
  return layer.bindPopup(table)
}
