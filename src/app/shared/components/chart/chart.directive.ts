import { Directive, ElementRef, input, effect, OnDestroy, Injector, runInInjectionContext, EmbeddedViewRef } from '@angular/core';
import * as echarts from 'echarts/core';
import { BarChart, LineChart, HeatmapChart } from 'echarts/charts';
import { GridComponent, TooltipComponent, LegendComponent, VisualMapComponent, MarkLineComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';

echarts.use([BarChart, LineChart, HeatmapChart, GridComponent, TooltipComponent, LegendComponent, VisualMapComponent, MarkLineComponent, CanvasRenderer]);

@Directive({
  selector: '[appChart]',
  standalone: true,
})
export class ChartDirective implements OnDestroy {
  readonly options = input.required<echarts.EChartsCoreOption>({ alias: 'appChart' });

  private chart: echarts.ECharts | null = null;

  constructor(private el: ElementRef<HTMLElement>, private injector: Injector) {
    runInInjectionContext(this.injector, () => {
      effect(() => {
        const opts = this.options();
        if (!this.chart) {
          this.chart = echarts.init(this.el.nativeElement);
        }
        this.chart.setOption(opts, { notMerge: true });
      });
    });
  }

  ngOnDestroy(): void {
    this.chart?.dispose();
  }
}
