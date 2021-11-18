const v = {

    data : {

        raw : null,

        nodes : null,
        links : null,

        root : null,

        read : (path) => {

            fetch(path)
              .then(response => response.json())
              .then(data => {
                //   const nodes = data.nodes;
                //   const links = data.links;

                //   v.data.root = d3.stratify()
                //     .id(function(d) { return d.name; })
                //     .parentId(function(d) { return d.parent; })
                //     (links);

                //   console.log(v.data.root);

                  v.data.nodes = data.nodes;
                  v.data.links = data.links;

                  v.ctrl.data_is_loaded();

              })

        }

    },

    sim : {

        obj : null,

        init : () => {

            const nodes = v.data.nodes;
            const links = v.data.links;

            v.sim.obj = d3.forceSimulation(nodes)
              .force(
                  "link", 
                  d3.forceLink(links)
                    .id(d => d.id)
                    .distance(20)
                    .strength(.5)
                )
              .force("charge", d3.forceManyBody().strength(
                function(d) {
                    return -Math.pow(v.vis.scales.r(d.n), 2.0) * .9;
                })) //-10
              .force("x", d3.forceX(450))
              .force("y", d3.forceY(250));

        },

        drag : (simulation) => {
  
                function dragstarted(event, d) {
                  if (!event.active) simulation.alphaTarget(0.3).restart();
                  d.fx = d.x;
                  d.fy = d.y;
                }
                
                function dragged(event, d) {
                  d.fx = event.x;
                  d.fy = event.y;
                }
                
                function dragended(event, d) {
                  if (!event.active) simulation.alphaTarget(0);
                  d.fx = null;
                  d.fy = null;
                }
                
                return d3.drag()
                    .on("start", dragstarted)
                    .on("drag", dragged)
                    .on("end", dragended);

        }

    },

    vis : {

        svg : 'svg.vis',

        nodes : null,
        links : null,

        scales : {

            r : d3.scaleSqrt(),

            set : () => {

                v.vis.scales.r
                  .domain(d3.extent(v.data.nodes, d => d.n))
                  .range([2,30])

            }

        },

        draw : () => {

            const svg = d3.select(v.vis.svg);

            const links = v.data.links;
            const nodes = v.data.nodes;
            const sim = v.sim.obj;

            v.vis.links = svg.append("g")
              .attr("stroke", "black")
              .attr("stroke-width", 0.4)
              .attr("stroke-opacity", 0.8)
                .selectAll("line")
                .data(links)
                .join("line")
                .attr("stroke", "#f20666")
                .attr("stroke-width", 0.12);
                //.attr("stroke", d => d.target.children ? null : "#f20666")
                //.attr("stroke-width", d => d.target.children ? null : 0.12);

            v.vis.nodes = svg.append("g")
              .selectAll("circle")
              .data(nodes)
              .join("circle")
              .attr("fill", d => d.type == "eixo" ? 'goldenrod' : 'dodgerblue')
              .attr("r", d => v.vis.scales.r(d.n))
              .call(v.sim.drag(sim));

            v.vis.nodes.append("title")
            .text(d => `${d.node} (${d.type})`);

            sim.on("tick", () => {
                v.vis.links
                    .attr("x1", d => d.source.x)
                    .attr("y1", d => d.source.y)
                    .attr("x2", d => d.target.x)
                    .attr("y2", d => d.target.y);
            
                v.vis.nodes
                    .attr("cx", d => d.x)
                    .attr("cy", d => d.y);
            });

        }


  




    },


    ctrl : {

        init : () => {

            v.data.read('network.json')

        },

        data_is_loaded : () => {

            v.vis.scales.set();
            v.sim.init();
            v.vis.draw();




        }

    }

}

v.ctrl.init();